# TDD Spec: Toxicity Moderation (M-10)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
Near-real-time audio scanning during live ranked voice calls for slurs, harassment, and prohibited terms. The goal is not perfect accuracy — it is a fast, lightweight deterrent that catches egregious violations during the match and flags them for review. False positives err toward a brief mute (low cost), not a ban (high cost).

### Architecture: Agora Cloud Recording + STT Hook
```
[Agora RTC Channel (live match)]
      │
      ▼
[Agora Cloud Recording — server-side composite recording]
      ▼
[Agora Real-Time Transcription (RTT) Plugin] ← lightweight, low-latency STT
      ▼
[Webhook → FastAPI /moderation/hook endpoint]
      │
      ▼
[Toxicity Classifier — keyword + ML]
      │
      ├─ CLEAN: no action
      │
      └─ FLAGGED:
            ├─ Mute offending player in Agora channel
            ├─ Create moderation_events record
            └─ Send alert to both players in-app
```

### Toxicity Classifier (Lightweight)
- **Stage 1 — Keyword Filter:** Banned term list per language (slurs, hate speech); exact match + phonetic variants
- **Stage 2 — ML Classifier:** `detoxify` Python library (multilingual transformer); score threshold 0.85 for "severe toxicity" category
- Both stages run synchronously on the webhook thread (target < 300ms total)
- If either stage flags content: trigger mute action

### Agora Moderation Actions
- **Mute:** Server-side channel mute for 60 seconds (first offense); permanent for session (second offense)
- **Kick:** On third offense, player is removed from the Agora channel (match ends, opponent wins)
- Actions executed via Agora REST API: `POST /v1/kicking-rule`

### Data Models

```sql
-- moderation_events
CREATE TABLE moderation_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id        UUID REFERENCES live_matches(id),
    reported_user_id UUID REFERENCES users(id),
    transcript_segment TEXT,            -- the offending text excerpt
    offense_type    TEXT NOT NULL,      -- 'keyword_match' | 'ml_flag'
    toxicity_score  NUMERIC(4,3),       -- detoxify score (0-1)
    action_taken    TEXT NOT NULL,      -- 'mute_60s' | 'mute_session' | 'kick'
    offense_count   INTEGER NOT NULL,   -- 1/2/3 within this match
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
| POST | `/moderation/hook` | Agora webhook secret | Receives RTT transcript chunks from Agora |
| GET | `/moderation/events` | Admin | List flagged events pending human review |
| PATCH | `/moderation/events/{event_id}` | Admin | Set reviewer verdict |
| POST | `/moderation/ban/{user_id}` | Admin | Issue a ban |
| GET | `/moderation/ban/{user_id}` | Bearer | Check if current user is banned |

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
def test_first_offense_action_is_mute_60s():
def test_second_offense_action_is_mute_session():
def test_third_offense_action_is_kick():
def test_offense_count_resets_per_match_not_per_user():
def test_webhook_signature_validation_rejects_invalid_secret():
def test_classifier_returns_within_300ms():
```

### Integration Tests

```python
# test_toxicity_integration.py
def test_webhook_creates_moderation_event_on_flag():
def test_webhook_no_event_created_for_clean_transcript():
def test_agora_mute_api_called_on_first_offense():
def test_agora_kick_api_called_on_third_offense():
def test_banned_user_cannot_enter_queue():
def test_admin_verdict_confirmed_updates_event_reviewed_flag():
def test_admin_verdict_false_positive_logs_correctly():
def test_multiple_flags_in_same_match_increment_offense_count():
```

### E2E Tests

```
Scenario: Player uses a banned term mid-match
  Given two players in an active live match
  When Player 1 says a banned term
  Then Player 1 is muted for 60 seconds
  And both players see a "Warning issued" in-app notification
  And a moderation_event is created for human review

Scenario: Banned user cannot queue
  Given a user with an active ban
  When they attempt to enter the ranked queue
  Then the API returns 403 with ban expiry information
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Productive discomfort only works in a safe environment. If players fear harassment, they will not speak authentically — they will play conservatively, or not at all. Toxicity moderation is the **psychological safety layer** that makes the competitive pressure of Tong feel exhilarating rather than threatening. The near-real-time mute (during the match, not post-match) ensures that the harm is interrupted before it escalates, while the post-match human review prevents ML false positives from becoming unjust bans. A clean, competitive arena is a prerequisite for the core product to function.

---

## 4. Bidirectional Links

- [features.md → M-10](../features.md)
- Related specs: [[tdd_spec_liveRankedBattles.md]] (Agora channel context), [[tdd_spec_postMatchPipeline.md]] (companion pipeline)
