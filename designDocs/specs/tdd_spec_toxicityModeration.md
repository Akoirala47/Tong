# TDD Spec: Toxicity Moderation (M-10)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> Cost strategy: [[tdd_spec_computeEconomics.md]] — post-match scan, no Agora RTT

---

## 1. Technical Specification

### Overview
Scan completed match transcripts for slurs, harassment, and prohibited terms. Runs as **Stage 1b** in the post-match pipeline after Whisper transcription (lite/full tiers only). The goal is effective deterrence without the cost of Agora Cloud Recording or Real-Time Transcription (RTT). Repeat offenders receive warnings and bans enforced at queue entry.

**MVP tradeoff:** No mid-match auto-mute. Violations are flagged post-match; bans block future queue entry. Mid-match moderation deferred to v2 (requires live STT — high cost).

### Architecture: Post-Match Transcript Scan

```
[Match Concluded → R2 upload → Whisper Stage 1]
      │
      ▼
[Stage 1b — Toxicity Scan]  (runs inside Celery pipeline)
      │
      ▼
[Toxicity Classifier — keyword + ML]
      │
      ├─ CLEAN: continue to DeepSeek grading
      │
      └─ FLAGGED:
            ├─ Create moderation_events record
            ├─ Increment user offense history
            ├─ Issue warning or ban (repeat offenders)
            └─ Push notification to affected players
```

No Agora webhook, cloud recording, or RTT required. Agora RTC is voice transport only (M-06).

### Toxicity Classifier (Lightweight)
- **Stage 1 — Keyword Filter:** Banned term list per language (slurs, hate speech); exact match + phonetic variants
- **Stage 2 — ML Classifier:** `detoxify` Python library (multilingual transformer); score threshold 0.85 for "severe toxicity" category
- Runs synchronously in Celery worker after transcript is available (target < 500ms)
- If either stage flags content: create moderation event and apply enforcement policy

### Enforcement Policy (Post-Match)

| Offense history (rolling 30 days) | Action |
|-----------------------------------|--------|
| 1st flagged match | Warning notification; event queued for human review |
| 2nd flagged match | 24-hour ranked queue ban |
| 3rd+ flagged match | 7-day ban; admin review required for permanent ban |

Admin can override via `PATCH /moderation/events/{id}` with verdict `false_positive`.

### Data Models

```sql
-- moderation_events
CREATE TABLE moderation_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id        UUID REFERENCES live_matches(id),
    job_id          UUID REFERENCES processing_jobs(id),
    reported_user_id UUID REFERENCES users(id),
    transcript_segment TEXT,            -- the offending text excerpt
    offense_type    TEXT NOT NULL,      -- 'keyword_match' | 'ml_flag'
    toxicity_score  NUMERIC(4,3),       -- detoxify score (0-1)
    action_taken    TEXT NOT NULL,      -- 'warning' | 'ban_24h' | 'ban_7d' | 'none'
    reviewed        BOOLEAN DEFAULT FALSE,
    reviewer_verdict TEXT,              -- 'confirmed' | 'false_positive' | NULL
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- user_bans
CREATE TABLE user_bans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    reason          TEXT NOT NULL,
    ban_type        TEXT NOT NULL,      -- 'temporary' | 'permanent'
    expires_at      TIMESTAMPTZ,        -- NULL for permanent
    issued_by       TEXT DEFAULT 'system',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/moderation/events` | Admin | List flagged events pending human review |
| PATCH | `/moderation/events/{event_id}` | Admin | Set reviewer verdict |
| POST | `/moderation/ban/{user_id}` | Admin | Issue a ban |
| GET | `/moderation/ban/{user_id}` | Bearer | Check if current user is banned |

No public webhook endpoint in MVP. Toxicity scan is internal to the Celery pipeline.

### Queue Entry Ban Check

`POST /matches/live/queue` calls `GET /moderation/ban/{user_id}` (or inline check) before adding player to Redis queue. Returns 403 with ban expiry if active.

---

## 2. TDD Requirements

### Unit Tests

```python
# test_toxicity_unit.py
def test_keyword_filter_detects_exact_banned_term():
def test_keyword_filter_detects_phonetic_variant():
def test_keyword_filter_is_case_insensitive():
def test_ml_classifier_score_above_threshold_returns_flagged():
def test_ml_classifier_score_below_threshold_returns_clean():
def test_first_offense_action_is_warning():
def test_second_offense_action_is_ban_24h():
def test_third_offense_action_is_ban_7d():
def test_classifier_skipped_for_metadata_only_pipeline_tier():
def test_classifier_runs_for_lite_and_full_tiers():
```

### Integration Tests

```python
# test_toxicity_integration.py
def test_toxic_transcript_creates_moderation_event():
def test_clean_transcript_no_moderation_event():
def test_flagged_user_receives_warning_push_notification():
def test_banned_user_cannot_enter_queue():
def test_admin_verdict_false_positive_clears_ban():
def test_moderation_scan_chained_after_whisper_in_celery_pipeline():
```

### E2E Tests

```
Scenario: Player uses banned language in live match
  Given two players complete a live match with lite analysis
  When the transcript contains a banned term
  Then a moderation_event is created
  And the offending player receives a warning notification
  And the match grading pipeline continues (ELO still updates)

Scenario: Banned user cannot queue
  Given a user with an active ban
  When they attempt to enter the ranked queue
  Then the API returns 403 with ban expiry information
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Productive discomfort requires psychological safety. Post-match moderation catches violations without the infrastructure cost of live STT, keeping the arena safe while preserving unit economics. Human review prevents ML false positives from becoming unjust bans.

**Deferred v2:** Mid-match auto-mute via live STT if product data shows post-match enforcement is insufficient.

---

## 4. Bidirectional Links

- [features.md → M-10](../features.md)
- Related specs: [[tdd_spec_computeEconomics.md]] (cost strategy), [[tdd_spec_postMatchPipeline.md]] (Stage 1b integration), [[tdd_spec_liveRankedBattles.md]] (queue ban check)
