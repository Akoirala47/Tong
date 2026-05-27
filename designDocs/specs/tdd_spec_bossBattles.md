# TDD Spec: Solo Grind — Boss Battles (M-04)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
Timed, comprehensive assessments that gate progression from one solo tier to the next. A player cannot unlock Silver-tier lessons until they defeat the Bronze Boss Battle. Boss Battles test cumulative knowledge across all chapters in the current tier.

### Boss Battle Structure
- **Duration:** Strictly enforced countdown timer (e.g., 8 minutes)
- **Question Pool:** Draws from all `exercise_cards` in the current tier (not just completed chapters)
- **Passing Threshold:** 80% correct within the time limit
- **Cooldown:** Failed attempt triggers a 24-hour cooldown before retry
- **Retries:** Unlimited, but each failure adds 24h cooldown (capped at 72h after 3 consecutive fails)

### Data Models

```sql
-- boss_battles (one per tier per language)
CREATE TABLE boss_battles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id         UUID REFERENCES content_tiers(id) UNIQUE,
    time_limit_sec  INTEGER NOT NULL DEFAULT 480,
    pass_threshold  NUMERIC(4,2) NOT NULL DEFAULT 80.00,
    question_count  INTEGER NOT NULL DEFAULT 30
);

-- user_boss_battle_attempts
CREATE TABLE user_boss_battle_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    battle_id       UUID REFERENCES boss_battles(id),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    score           NUMERIC(5,2),        -- NULL if timed out or abandoned
    passed          BOOLEAN,
    next_attempt_at TIMESTAMPTZ          -- NULL if passed; cooldown expiry otherwise
);

-- user_tier_unlocks
CREATE TABLE user_tier_unlocks (
    user_id         UUID REFERENCES users(id),
    tier_id         UUID REFERENCES content_tiers(id),
    unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, tier_id)
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/boss-battles/current` | Bearer | Get the boss battle for user's current tier, with eligibility status |
| POST | `/boss-battles/{battle_id}/start` | Bearer | Start attempt; returns question set + server-side start timestamp |
| POST | `/boss-battles/{battle_id}/submit` | Bearer | Submit all answers; server validates timer; returns result |
| GET | `/boss-battles/{battle_id}/history` | Bearer | User's past attempt history for this battle |

### Timer Enforcement
- Server records `started_at` when attempt begins
- On submit: if `NOW() - started_at > time_limit_sec + 5s (grace)`, answers after the deadline are discarded
- Client timer is display-only; server is authoritative

---

## 2. TDD Requirements

### Unit Tests

```python
# test_boss_battles_unit.py
def test_score_calculation_30_correct_of_30_is_100():
def test_score_calculation_24_correct_of_30_is_80():
def test_score_above_threshold_marks_attempt_as_passed():
def test_score_below_threshold_marks_attempt_as_failed():
def test_cooldown_after_first_fail_is_24_hours():
def test_cooldown_after_second_consecutive_fail_is_48_hours():
def test_cooldown_after_third_plus_consecutive_fail_is_72_hours():
def test_consecutive_fail_counter_resets_on_pass():
def test_answers_submitted_after_timer_expiry_are_discarded():
def test_question_set_sampling_draws_from_all_chapters_in_tier():
def test_question_set_is_randomized_across_attempts():
```

### Integration Tests

```python
# test_boss_battles_integration.py
def test_start_attempt_records_started_at_in_db():
def test_cannot_start_battle_during_active_cooldown():
def test_passing_battle_creates_tier_unlock_record():
def test_passing_battle_unlocks_next_tier_lessons():
def test_failing_battle_sets_next_attempt_at_correctly():
def test_cannot_access_next_tier_lessons_without_tier_unlock():
def test_submitting_after_grace_period_marks_timed_out():
def test_history_endpoint_returns_all_past_attempts():
```

### E2E Tests

```
Scenario: Player defeats Bronze Boss Battle and unlocks Silver
  Given a Bronze player who has completed all Bronze chapters
  When they start the Boss Battle and answer correctly within time
  And their score is >= 80%
  Then they see a "Tier Cleared" victory screen
  And Silver-tier lessons appear as unlocked in Solo Grind

Scenario: Player fails Boss Battle and is put on cooldown
  Given a Bronze player
  When they submit a Boss Battle with score < 80%
  Then they see a "Not Yet" screen with their score
  And the "Start Battle" button shows a cooldown timer (24h)

Scenario: Server discards late answers
  Given a player who pauses mid-battle past the timer
  When they submit answers after the timer
  Then only answers submitted within the time window are graded
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Boss Battles are the **forcing function** of the solo path. Without them, players could advance through tiers on partial knowledge, eventually entering ranked matches they are not prepared for — which would feel unfair rather than productively difficult. The 80% pass threshold and the cooldown system ensure that progression is earned, not assumed.

The server-side timer enforcement is critical: it cannot be gamed by a slow UI or paused network connection. Tong must be a meritocracy — the rank you hold is the rank you earned. Boss Battles are the first place in the product where that principle is enforced mechanically.

---

## 4. Bidirectional Links

- [features.md → M-04](../features.md)
- Related specs: [[tdd_spec_microLessons.md]] (content pool source), [[tdd_spec_eloMatchmaking.md]] (tier-rank relationship), [[tdd_spec_gamification.md]] (XP on battle victory)
