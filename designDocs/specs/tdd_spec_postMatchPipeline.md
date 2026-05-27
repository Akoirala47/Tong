# TDD Spec: Post-Match Processing Pipeline — Core (M-08)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
The asynchronous processing pipeline that evaluates every completed match and async duel. Audio is uploaded to R2, a Celery job is queued, worker nodes run Whisper transcription and DeepSeek grading, ELO is updated, feedback is delivered, and flagged words are injected into the player's flashcard queue. Toxicity moderation runs **during** the live match (not post); all other processing runs post-match.

### Pipeline Stages (Core MVP)

```
[Match Concluded]
      │
      ▼
[Client uploads audio → Cloudflare R2]
      │
      ▼
[API dispatches Celery task: process_match(match_id)]
      │
      ▼
[Worker: Stage 1 — Whisper Transcription]
  whisper-large-v3-turbo
  Input:  audio file from R2
  Output: transcript text + word-level timestamps
      │
      ▼
[Worker: Stage 2 — DeepSeek Grading]
  DeepSeek-V4-Flash
  Input:  transcript, prompt_text, word timestamps
  Output: {
    winner: "player1" | "player2" | "draw",
    prompt_adherence_p1: 0-100,
    prompt_adherence_p2: 0-100,
    vocabulary_score_p1: 0-100,
    vocabulary_score_p2: 0-100,
    wpm_p1: float,
    wpm_p2: float,
    filler_words_p1: [{word, count}],
    filler_words_p2: [{word, count}],
    flagged_words_p1: [str],   -- mispronounced/misused, for flashcard injection
    flagged_words_p2: [str],
    feedback_p1: str,          -- natural language coaching paragraph
    feedback_p2: str
  }
      │
      ▼
[Worker: Stage 3 — ELO Update]
  Calls ELO calculation service
  Updates profiles table + writes elo_history
      │
      ▼
[Worker: Stage 4 — Flashcard Injection]
  POST /flashcards/inject for each flagged word per player
      │
      ▼
[Worker: Stage 5 — Result Delivery]
  Writes to live_match_results or async_duel_results
  Updates match status → 'completed'
  Sends push notification to both players
```

### Data Models

```sql
-- processing_jobs (tracks pipeline state)
CREATE TABLE processing_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type     TEXT NOT NULL,       -- 'live_match' | 'async_duel'
    source_id       UUID NOT NULL,
    celery_task_id  TEXT,
    status          TEXT NOT NULL DEFAULT 'queued',
                                         -- 'queued' | 'transcribing' | 'grading' | 'updating_elo' | 'injecting' | 'completed' | 'failed'
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
    model_version   TEXT DEFAULT 'whisper-large-v3-turbo',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Toxicity Moderation (During Live Match — M-10 companion)
See [[tdd_spec_toxicityModeration.md]] for full spec. Summary:
- Lightweight STT pipeline runs on live audio feed (separate from Whisper post-match)
- Operates via Agora's server-side cloud recording + real-time hook
- On detection: auto-mute offending player, flag the match for human review

### Free vs Pro Tier Gating (MVP Enforcement)
- **Free Tier:** Only the **first** live match per day triggers the full pipeline. Subsequent matches on the same day receive a result based on match metadata only (duration, engagement signals), no transcript or feedback.
- **Pro Tier:** Every match and every async duel runs the full pipeline (Post-MVP, see [[tdd_spec_tongPro.md]])

Free-tier gate logic: check `processing_jobs` count for `user_id + DATE(NOW())` before dispatching Celery task.

### DeepSeek Prompt Template (Grading)

```
You are an expert language proficiency referee for a competitive language-learning app.
Language: {language}
Target CEFR Level: {cefr_level}
Conversational Prompt: {prompt_text}

Transcripts:
Player 1: {transcript_p1}
Player 2: {transcript_p2}

Evaluate both players on:
1. Prompt adherence (0-100)
2. Vocabulary complexity and accuracy (0-100)
3. Filler word usage (list all "um", "uh", "like" etc.)
4. Flagged words/phrases used incorrectly or mispronounced
5. Determine winner based on overall performance
6. Provide 2-3 sentence coaching feedback per player

Return structured JSON matching this schema: {...}
```

---

## 2. TDD Requirements

### Unit Tests

```python
# test_post_match_unit.py
def test_whisper_output_parsed_to_word_timestamp_array():
def test_wpm_calculated_correctly_from_word_count_and_duration():
def test_deepseek_response_parsed_to_result_schema():
def test_deepseek_response_missing_fields_raises_validation_error():
def test_elo_update_called_with_correct_winner():
def test_flagged_words_injected_for_correct_player():
def test_free_tier_gate_blocks_second_match_same_day():
def test_free_tier_gate_allows_first_match_any_day():
def test_job_status_transitions_are_sequential_and_valid():
def test_failed_stage_sets_job_status_to_failed():
def test_retry_on_transient_error_up_to_3_times():
```

### Integration Tests

```python
# test_post_match_integration.py
def test_match_concluded_dispatches_celery_task():
def test_celery_task_writes_transcript_to_db():
def test_celery_task_writes_result_to_live_match_results():
def test_celery_task_updates_elo_for_both_players():
def test_celery_task_injects_flagged_words_into_flashcard_queue():
def test_celery_task_sends_push_notification_on_completion():
def test_result_endpoint_returns_404_while_job_in_progress():
def test_result_endpoint_returns_data_on_job_completed():
def test_free_tier_second_match_result_has_no_feedback_field():
def test_failed_job_does_not_update_elo():
def test_failed_job_retried_up_to_3_times():
```

### E2E Tests

```
Scenario: End-to-end post-match processing for a free-tier player (first match of day)
  Given two players complete a live match
  When both upload their audio recordings
  Then within 60 seconds, both receive push notifications
  And the result screen shows WPM, feedback paragraph, and ELO change
  And flagged vocabulary appears in each player's flashcard queue

Scenario: Free-tier second match is processed without deep feedback
  Given a free-tier player who already had one match processed today
  When their second match concludes
  Then the result screen shows ELO change only (no WPM or feedback)
  And no transcript is generated

Scenario: Worker failure retries gracefully
  Given a match in 'transcribing' state
  When the Whisper API call fails transiently
  Then the Celery task retries up to 3 times with exponential backoff
  And on third failure, job status is set to 'failed'
  And players receive a "Processing failed" notification
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The post-match pipeline is what transforms a competitive voice app into a **learning system**. Without it, Tong would be ranked voice calls with no feedback loop — the pressure without the payoff. Every match is a data source: the WPM reveals pacing issues, the filler words reveal anxiety patterns, the flagged vocabulary reveals the specific knowledge gaps. All of this feeds directly back into the Solo Grind flashcard system, closing the loop between competitive performance and deliberate practice. The free-tier gate (one full analysis per day) also creates a clear, tangible value proposition for Tong Pro that users experience organically.

---

## 4. Bidirectional Links

- [features.md → M-08](../features.md)
- Related specs: [[tdd_spec_liveRankedBattles.md]] (trigger), [[tdd_spec_asyncAudioDuels.md]] (trigger), [[tdd_spec_eloMatchmaking.md]] (ELO update), [[tdd_spec_intelligentFlashcards.md]] (word injection), [[tdd_spec_toxicityModeration.md]] (live companion), [[tdd_spec_phonemeAnalysis.md]] (Post-MVP Stage 2.5), [[tdd_spec_tongPro.md]] (free vs pro gate)
