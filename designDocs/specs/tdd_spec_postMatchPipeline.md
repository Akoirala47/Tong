# TDD Spec: Post-Match Processing Pipeline — Core (M-08)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> Pipeline tiers and cost rules: [[tdd_spec_computeEconomics.md]] (canonical)

---

## 1. Technical Specification

### Overview
The asynchronous processing pipeline that evaluates completed live matches and async duels. Audio is uploaded to R2, a tiered Celery job is queued, worker nodes run transcription/grading appropriate to the user's plan, ELO is updated, feedback is delivered, and flagged words are injected into flashcard queues where applicable. Toxicity moderation runs **post-match** on transcripts (see [[tdd_spec_toxicityModeration.md]]); live voice transport (Agora) is voice-only.

### Pipeline Tier Resolution

Before dispatch, call `resolve_pipeline_tier(user_id, source_type)` (see [[tdd_spec_computeEconomics.md]]):

| Tier | When | ASR engine | DeepSeek | ELO | Flashcards |
|------|------|-----------|----------|-----|------------|
| `metadata_only` | Free 2nd+ live match same day; all free async duels; Plus when capped | Skip | Skip | Yes | No |
| `lite` | Free 1st live match of day; Plus within cap; Plus async | `whisper-small` CPU | Short prompt | Yes | Yes |
| `full` | Pro live + async | `qwen3-asr-0.6b` + ForcedAligner | Full prompt | Yes | Yes |
| `elite` | Elite live + async | `whisper-large-v3-turbo` GPU | Full prompt | Yes | Yes |
| `elite_phoneme` | Elite on-demand (P-04) | `whisper-large-v3-turbo` GPU | Full + phoneme | Yes | Yes |

### Pipeline Stages

```
[Match/Duel Concluded]
      │
      ├─ Live match: Agora Cloud Recording → R2 (server-side, triggered by /webhooks/agora/recording)
      │              metadata_only players: pipeline dispatched immediately, no audio needed
      │
      ├─ Async duel move: client uploads short clip → R2 pre-signed URL (90s max, client upload fine)
      │
      ▼
[API: resolve_pipeline_tier() per player → dispatch Celery task]
      │
      ├─ metadata_only ─────────────────────────────────────┐
      │                                                      │
      ▼                                                      ▼
[Stage 1 — ASR Transcription]                  [Skip to Stage 3 — Metadata ELO]
  lite: faster-whisper/whisper-small CPU
  full: vLLM/qwen3-asr-0.6b + ForcedAligner
  elite: faster-whisper/whisper-large-v3-turbo GPU
  VAD silence trim before transcribe
  Output: transcript + word-level timestamps
      │
      ▼
[Stage 1b — Toxicity Scan]  (lite/full/full_phoneme only)
  Keyword + detoxify on transcript → moderation_events
      │
      ▼
[Stage 2 — DeepSeek Grading]
  Prompt variant per tier (lite vs full)
  Output: winner, scores, WPM, filler words, flagged words, feedback
      │
      ▼
[Stage 2.5 — Phoneme Analysis]  (elite_phoneme only — Post-MVP P-04)
      │
      ▼
[Stage 3 — ELO Update]
  Full path: winner from DeepSeek
  Metadata path: duration/engagement/forfeit signals
      │
      ▼
[Stage 4 — Flashcard Injection]  (lite/full/full_phoneme only)
      │
      ▼
[Stage 5 — Result Delivery]
  Push notification; match status → 'completed'
```

### Worker Queue Routing

| Subscription | Queue | Hardware |
|-------------|-------|----------|
| Free / Plus | `standard` | CPU (lite, metadata_only) |
| Pro | `qwen` | GPU + vLLM (full) |
| Elite | `elite_gpu` | GPU + faster-whisper (elite, elite_phoneme) |

See [[tdd_spec_priorityQueue.md]] for SLA targets.

### Data Models

```sql
-- processing_jobs (tracks pipeline state)
CREATE TABLE processing_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) NOT NULL,
    source_type     TEXT NOT NULL,       -- 'live_match' | 'async_duel'
    source_id       UUID NOT NULL,
    pipeline_tier   TEXT NOT NULL DEFAULT 'lite',
                                         -- 'metadata_only' | 'lite' | 'full' | 'full_phoneme'
    analysis_type   TEXT NOT NULL DEFAULT 'full',
                                         -- 'full' | 'metadata_only'
    queue_type      TEXT NOT NULL DEFAULT 'standard',
                                         -- 'standard' | 'priority'
    celery_task_id  TEXT,
    status          TEXT NOT NULL DEFAULT 'queued',
                                         -- 'queued' | 'transcribing' | 'moderating' | 'grading'
                                         -- | 'updating_elo' | 'injecting' | 'completed' | 'failed'
    stage_completed TEXT,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- transcripts
CREATE TABLE transcripts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID REFERENCES processing_jobs(id),
    player_id       UUID REFERENCES users(id),
    text            TEXT NOT NULL,
    word_timestamps JSONB NOT NULL,      -- [{word, start_sec, end_sec}]
    wpm             NUMERIC(6,2),
    model_version   TEXT NOT NULL,       -- 'whisper-small' | 'qwen3-asr-0.6b' | 'whisper-large-v3-turbo'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Tier Resolver (entry point)

```python
def resolve_pipeline_tier(user_id: str, source_type: str) -> str:
    sub = subscription_tier(user_id)  # 'free' | 'plus' | 'pro' | 'elite'
    if sub == "elite":
        return "elite"
    if sub == "pro":
        return "full"
    if source_type == "async_duel":
        if sub == "free":
            return "metadata_only"
        return "lite"   # plus gets lite async
    if source_type == "live_match":
        if sub == "plus" and monthly_coaching_cap_reached(user_id):
            return "metadata_only"
        if sub == "free" and daily_lite_cap_reached(user_id):
            return "metadata_only"
        return "lite"
    return "metadata_only"


def dispatch_processing_job(user_id: str, source_type: str, source_id: str):
    tier = resolve_pipeline_tier(user_id, source_type)
    sub = subscription_tier(user_id)
    if sub == "elite":
        queue = "elite_gpu"
    elif sub == "pro":
        queue = "qwen"
    else:
        queue = "standard"
    process_match.apply_async(
        args=[source_id, source_type, tier],
        queue=queue,
    )
```

### Tier Gating (MVP + Post-MVP)

- **Free — live:** 1 **lite** analysis per day; subsequent same-day matches → `metadata_only`
- **Free — async:** `metadata_only` only (ELO/win-loss, no transcript/feedback)
- **Plus (P-07):** Ad-free; ~15 full coaching jobs/month cap (lite path); lite async grading
- **Pro (P-07):** Unlimited Qwen full pipeline every live match + async duel; priority Qwen queue
- **Elite (P-07):** Unlimited Whisper turbo pipeline + on-demand phoneme → `elite_phoneme`; priority Elite queue

Cap enforcement is server-side via `resolve_pipeline_tier()`; client cannot override.

### DeepSeek Prompt Variants

**Lite prompt** (free daily analysis): winner, adherence scores, flagged words, 1–2 sentence feedback per player.

**Full prompt** (Pro): complete grading schema including WPM, filler words, detailed coaching paragraphs.

```
You are an expert language proficiency referee for a competitive language-learning app.
Language: {language}
Target CEFR Level: {cefr_level}
Conversational Prompt: {prompt_text}
Pipeline tier: {pipeline_tier}

Transcripts:
Player 1: {transcript_p1}
Player 2: {transcript_p2}

[Full tier only: evaluate WPM, filler words, detailed feedback]
[Lite tier: winner, scores, flagged words, brief feedback]

Return structured JSON matching this schema: {...}
```

---

## 2. TDD Requirements

### Unit Tests

```python
# test_post_match_unit.py
def test_resolve_pipeline_tier_pro_returns_full():
def test_resolve_pipeline_tier_elite_returns_elite():
def test_resolve_pipeline_tier_plus_async_returns_lite():
def test_resolve_pipeline_tier_free_async_returns_metadata_only():
def test_resolve_pipeline_tier_free_first_live_match_returns_lite():
def test_resolve_pipeline_tier_free_second_live_match_same_day_returns_metadata_only():
def test_resolve_pipeline_tier_plus_when_monthly_cap_reached_returns_metadata_only():
def test_asr_output_parsed_to_word_timestamp_array():
def test_lite_tier_uses_whisper_small_model():
def test_full_tier_uses_qwen3_asr_model():
def test_elite_tier_uses_whisper_large_v3_turbo():
def test_wpm_calculated_correctly_from_word_count_and_duration():
def test_deepseek_lite_prompt_returns_valid_schema():
def test_deepseek_full_prompt_returns_valid_schema():
def test_metadata_only_skips_whisper_and_deepseek():
def test_metadata_only_still_updates_elo():
def test_elo_update_called_with_correct_winner():
def test_flagged_words_injected_for_lite_and_full_tiers():
def test_metadata_only_does_not_inject_flashcards():
def test_free_tier_cap_counts_lite_jobs_only():
def test_job_status_transitions_are_sequential_and_valid():
def test_failed_stage_sets_job_status_to_failed():
def test_retry_on_transient_error_up_to_3_times():
def test_pro_jobs_dispatched_to_priority_queue():
def test_free_jobs_dispatched_to_standard_queue():
```

### Integration Tests

```python
# test_post_match_integration.py
def test_match_concluded_dispatches_celery_task_with_correct_tier():
def test_celery_task_writes_transcript_to_db_for_lite_tier():
def test_celery_task_writes_result_to_live_match_results():
def test_celery_task_updates_elo_for_both_players():
def test_celery_task_injects_flagged_words_on_lite_tier():
def test_metadata_only_job_skips_transcript_table():
def test_toxicity_scan_runs_after_whisper_on_lite_tier():
def test_celery_task_sends_push_notification_on_completion():
def test_result_endpoint_returns_404_while_job_in_progress():
def test_free_tier_second_match_result_has_no_feedback_field():
def test_free_async_duel_result_has_elo_only():
def test_failed_job_does_not_update_elo():
```

### E2E Tests

```
Scenario: Free-tier first live match of day (lite analysis)
  Given two free-tier players complete a live match
  When both upload their audio recordings
  Then within 120 seconds, both receive push notifications
  And the result screen shows WPM, brief feedback, and ELO change
  And flagged vocabulary appears in each player's flashcard queue

Scenario: Free-tier second match is metadata-only
  Given a free-tier player who already had one lite analysis today
  When their second match concludes
  Then the result screen shows ELO change only (no WPM or feedback)
  And no transcript is generated

Scenario: Free async duel completes with metadata-only grading
  Given a free-tier player completes an async duel
  When grading runs
  Then the result shows winner and ELO delta only
  And no transcript or feedback is generated

Scenario: Worker failure retries gracefully
  Given a match in 'transcribing' state
  When the Whisper call fails transiently
  Then the Celery task retries up to 3 times with exponential backoff
  And on third failure, job status is set to 'failed'
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The post-match pipeline transforms competitive voice into a **learning system**. Tiered compute ensures free users get genuine daily coaching (lite analysis) while Pro users receive unlimited depth. The free-tier gate creates organic upgrade intent without blocking core ranked gameplay — metadata-only matches still update ELO and XP.

---

## 4. Bidirectional Links

- [features.md → M-08](../features.md)
- Related specs: [[tdd_spec_computeEconomics.md]] (canonical tiers), [[tdd_spec_liveRankedBattles.md]] (trigger), [[tdd_spec_asyncAudioDuels.md]] (trigger), [[tdd_spec_eloMatchmaking.md]] (ELO update), [[tdd_spec_intelligentFlashcards.md]] (word injection), [[tdd_spec_toxicityModeration.md]] (post-match scan), [[tdd_spec_phonemeAnalysis.md]] (Post-MVP Stage 2.5), [[tdd_spec_tongPro.md]] (free vs pro gate), [[tdd_spec_priorityQueue.md]] (queue routing)
