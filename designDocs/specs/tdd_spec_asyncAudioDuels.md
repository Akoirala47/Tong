# TDD Spec: Async Audio Duels (M-05)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
Turn-based voice messaging battles played asynchronously. Each player records a voice response to a conversational prompt and sends it as their "move." Opponents have a 12-hour window to respond. Winning earns micro-ELO. Functions as the daily chess puzzle equivalent — low pressure, high engagement.

### Duel Lifecycle
```
Created → Awaiting Player 1 Move → Awaiting Player 2 Move → [Repeat up to N rounds] → Completed → Grading → Result Delivered
```

- **Rounds:** 3 by default (each player speaks 3 times)
- **Turn Window:** 12 hours per turn; forfeit = automatic loss if timer expires
- **Max Active Duels (Free Tier):** 3 simultaneous active duels (enforced server-side)
- **Matching:** Paired with a player within ±150 ELO, or best available after 5-minute wait

### Data Models

```sql
-- async_duels
CREATE TABLE async_duels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id      UUID REFERENCES users(id),
    player2_id      UUID REFERENCES users(id),
    language        TEXT NOT NULL,
    prompt_text     TEXT NOT NULL,          -- static for MVP; JIT-generated Post-MVP
    status          TEXT NOT NULL DEFAULT 'active',
                                            -- 'active' | 'completed' | 'forfeited' | 'grading'
    current_turn    UUID REFERENCES users(id),   -- whose turn it is
    round_count     INTEGER NOT NULL DEFAULT 3,
    current_round   INTEGER NOT NULL DEFAULT 1,
    winner_id       UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ             -- current turn deadline
);

-- async_duel_moves
CREATE TABLE async_duel_moves (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duel_id         UUID REFERENCES async_duels(id),
    player_id       UUID REFERENCES users(id),
    round           INTEGER NOT NULL,
    audio_url       TEXT NOT NULL,          -- Cloudflare R2 URL
    duration_sec    NUMERIC(6,2),
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- async_duel_results
CREATE TABLE async_duel_results (
    duel_id         UUID PRIMARY KEY REFERENCES async_duels(id),
    player1_score   NUMERIC(5,2),
    player2_score   NUMERIC(5,2),
    elo_delta_p1    INTEGER,                -- ELO change for player 1
    elo_delta_p2    INTEGER,                -- ELO change for player 2
    feedback_p1     JSONB,                  -- DeepSeek feedback object
    feedback_p2     JSONB,
    graded_at       TIMESTAMPTZ
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/duels/async/queue` | Bearer | Enter matchmaking queue for an async duel |
| GET | `/duels/async/active` | Bearer | List all active duels for the current user |
| GET | `/duels/async/{duel_id}` | Bearer | Get duel state, moves, and current prompt |
| POST | `/duels/async/{duel_id}/move` | Bearer | Upload audio move (multipart); advances turn |
| GET | `/duels/async/{duel_id}/result` | Bearer | Get final result and feedback (post-grading) |
| POST | `/duels/async/{duel_id}/forfeit` | Bearer | Forfeit active duel |

### Audio Upload Flow
1. Client records voice note locally (max 90 seconds)
2. Client uploads compressed audio (`opus` codec, `ogg` container) directly to a pre-signed Cloudflare R2 URL obtained from the API
3. API records the `audio_url` in `async_duel_moves`
4. API advances `current_turn` and resets `expires_at = NOW() + 12h`
5. Push notification sent to opponent

### Forfeit on Timeout
- Celery beat task runs every 5 minutes: checks all active duels where `expires_at < NOW()` and `status = 'active'`
- Marks the duel as `forfeited`, sets `winner_id` to the opponent
- Sends push notification to both players

### Post-Match Grading (Pipeline Tiers)

On duel completion (`status → 'grading'`), dispatch `process_match` with `source_type='async_duel'` for each player via `resolve_pipeline_tier()`:

| Subscription | Pipeline tier | Result |
|-------------|---------------|--------|
| Free | `metadata_only` | Winner, ELO delta only — no transcript, feedback, or flashcard injection |
| Plus (P-07) | `lite` | whisper-small + short DeepSeek feedback + flashcard injection |
| Pro (P-07) | `full` | Qwen3-ASR + full DeepSeek grading + feedback + flashcard injection |
| Elite (P-07) | `elite` | Whisper large-v3-turbo + full DeepSeek + feedback + flashcard injection |

See [[tdd_spec_postMatchPipeline.md]] and [[tdd_spec_computeEconomics.md]].

---

## 2. TDD Requirements

### Unit Tests

```python
# test_async_duels_unit.py
def test_turn_advances_to_opponent_after_move_submitted():
def test_expires_at_set_to_12h_from_now_on_move():
def test_round_increments_after_both_players_complete_round():
def test_duel_status_set_to_completed_after_final_round():
def test_forfeit_sets_winner_to_opponent():
def test_forfeit_check_only_affects_duels_past_expires_at():
def test_free_tier_cap_enforced_at_3_active_duels():
def test_audio_duration_over_90s_rejected():
def test_move_rejected_if_not_players_turn():
def test_move_rejected_if_duel_completed():
```

### Integration Tests

```python
# test_async_duels_integration.py
def test_queue_creates_duel_within_elo_range():
def test_queue_creates_duel_with_best_available_after_5min():
def test_submit_move_saves_audio_url_and_advances_turn():
def test_celery_forfeit_task_runs_on_expired_duel():
def test_get_active_duels_returns_only_users_duels():
def test_free_tier_fourth_duel_request_returns_403():
def test_complete_duel_triggers_grading_celery_task():
def test_free_user_grading_uses_metadata_only_tier():
def test_pro_user_grading_uses_full_tier():
def test_grading_task_updates_elo_for_both_players():
def test_grading_task_injects_flagged_words_for_pro_only():
def test_push_notification_sent_to_opponent_on_move():
```

### E2E Tests

```
Scenario: Full 3-round async duel cycle
  Given two players matched for an async duel
  When Player 1 records and submits their voice note for Round 1
  Then Player 2 receives a push notification
  And Player 2 can listen to Player 1's recording before responding
  And after 3 rounds each, the duel status becomes 'grading'
  And both players receive a result screen with ELO change

Scenario: Duel forfeits on expired turn
  Given a duel where it is Player 2's turn
  When 12 hours pass without a response
  Then a Celery task marks Player 1 as the winner
  And both players receive a "Opponent forfeited" notification

Scenario: Free tier cap is enforced
  Given a free-tier player with 3 active async duels
  When they try to queue for a 4th duel
  Then the API returns a 403 with "Daily duel limit reached"
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Async Duels are the **daily habit anchor**. They are the chess puzzle — the low-commitment touchpoint that keeps the player speaking every single day even when they cannot commit to the intensity of a live ranked match. The 12-hour window is permissive enough to fit into any schedule, but the forfeit mechanic ensures that avoidance has a cost (a lost ELO delta and a loss record). The micro-ELO gain from async wins also means these are not purely casual — they incrementally affect the competitive ladder, creating a meaningful stakes gradient between async play and live ranked.

---

## 4. Bidirectional Links

- [features.md → M-05](../features.md)
- Related specs: [[tdd_spec_eloMatchmaking.md]] (ELO updates), [[tdd_spec_postMatchPipeline.md]] (grading pipeline), [[tdd_spec_tongPro.md]] (Pro full async grading), [[tdd_spec_computeEconomics.md]] (tier rules), [[tdd_spec_intelligentFlashcards.md]] (word injection), [[tdd_spec_gamification.md]] (XP on completion)
