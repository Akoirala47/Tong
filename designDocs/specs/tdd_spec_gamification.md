# TDD Spec: Gamification & Progression — Core (M-09)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
Esports-style progression hooks: XP earned from all activity types, daily login streaks with streak shields, rank badges displayed on profiles, and the underlying events system that powers all of it. This spec covers the MVP core. Leaderboards are Post-MVP (P-06).

### XP Award Table

| Activity | XP Awarded |
|----------|-----------|
| Complete a micro-lesson | 50 XP |
| Complete a micro-lesson with 100% score | +25 XP bonus |
| Complete a flashcard review session (≥10 cards) | 20 XP |
| Win a live ranked match | 100 XP |
| Lose a live ranked match | 30 XP |
| Win an async duel | 60 XP |
| Lose an async duel | 15 XP |
| Defeat a Boss Battle | 200 XP |
| Daily login streak (any activity) | 10 XP |
| 7-day streak milestone | 50 XP bonus |

### Rank Badges
Badge display is derived from `profiles.rank_tier` (computed from ELO, owned by [[tdd_spec_eloMatchmaking.md]]). Badge assets are static per tier — no additional data model needed. Profile endpoint returns `rank_tier` which the client renders with the correct badge asset.

### Streak System
- `profiles.streak_days` increments by 1 each day the user completes at least one activity
- Activity types that count toward streak: lesson completion, flashcard session, live match, async duel move
- If 24h passes without any qualifying activity, streak resets to 0
- **Streak Shield:** Users earn 1 streak shield per 7-day streak milestone. A shield auto-activates to absorb one missed day.

### Data Models

```sql
-- xp_events (append-only ledger)
CREATE TABLE xp_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    source_type     TEXT NOT NULL,       -- 'lesson' | 'flashcard' | 'live_match' | 'async_duel' | 'boss_battle' | 'streak'
    source_id       UUID,
    xp_amount       INTEGER NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- streak_shields
CREATE TABLE streak_shields (
    user_id         UUID REFERENCES users(id),
    shields_count   INTEGER NOT NULL DEFAULT 0,
    last_earned_at  TIMESTAMPTZ,
    PRIMARY KEY (user_id)
);

-- daily_activity_log (for streak tracking)
CREATE TABLE daily_activity_log (
    user_id         UUID REFERENCES users(id),
    activity_date   DATE NOT NULL,
    activity_type   TEXT NOT NULL,
    PRIMARY KEY (user_id, activity_date, activity_type)
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/gamification/me` | Bearer | Current XP, level, streak, shields, recent XP events |
| GET | `/gamification/xp-history` | Bearer | Paginated XP event history |
| POST | `/gamification/xp` | Internal | Award XP (called by lesson, match, and duel completion handlers) |
| POST | `/gamification/streak/check` | Internal | Called on any qualifying activity; updates streak and awards shields |

### XP → Level Calculation
- Level = floor(sqrt(total_xp / 100))
- Level 1 at 100 XP, Level 10 at 10,000 XP, Level 50 at 250,000 XP
- Level is display-only; no gameplay gating on level (only rank tier gates content)

---

## 2. TDD Requirements

### Unit Tests

```python
# test_gamification_unit.py
def test_xp_level_1_at_100_xp():
def test_xp_level_10_at_10000_xp():
def test_xp_level_formula_is_floor_sqrt_xp_div_100():
def test_streak_increments_on_activity():
def test_streak_resets_to_zero_after_24h_inactivity():
def test_streak_not_incremented_twice_same_day():
def test_streak_shield_activates_on_missed_day_if_available():
def test_streak_shield_count_decrements_on_activation():
def test_streak_shield_earned_at_7_day_milestone():
def test_streak_shield_not_earned_below_7_days():
def test_xp_event_created_for_every_award():
def test_lesson_perfect_score_awards_bonus_xp():
def test_boss_battle_victory_awards_200_xp():
```

### Integration Tests

```python
# test_gamification_integration.py
def test_lesson_completion_triggers_xp_award():
def test_match_win_triggers_xp_award():
def test_match_loss_triggers_xp_award():
def test_xp_updates_profiles_xp_total():
def test_streak_check_on_login_updates_streak_days():
def test_7_day_streak_milestone_adds_shield_to_streak_shields():
def test_shield_consumed_on_missed_day():
def test_xp_history_endpoint_returns_paginated_events():
def test_gamification_me_returns_correct_aggregates():
```

### E2E Tests

```
Scenario: Player earns XP and sees it update in real time
  Given a player on the solo grind screen
  When they complete a lesson with a perfect score
  Then the XP counter animates up by 75 (50 base + 25 bonus)
  And the activity log is updated

Scenario: Streak protection via shield
  Given a player with a 10-day streak and 1 shield
  When they miss a day of activity
  Then the shield auto-activates
  And their streak shows 11 days (not reset)
  And their shield count shows 0

Scenario: 7-day streak milestone
  Given a player on a 6-day streak
  When they complete any activity on day 7
  Then they receive a "7-Day Streak!" notification
  And 1 streak shield is added to their inventory
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Gamification is the **habit scaffold**. The mechanisms here — XP, streaks, shields, badges — exist to bridge the player across the gap between sessions. A player who opens Tong on day 2 because they don't want to break their streak will, by necessity, speak again today. The shield system is a deliberate retention mechanism: it rewards consistency while acknowledging real life, preventing the single missed day from destroying a relationship with the product that took weeks to build. The rank badges on the profile are the social proof of progress — every time a player shares their profile, they are advertising both Tong and their own earned status.

---

## 4. Bidirectional Links

- [features.md → M-09](../features.md)
- Related specs: [[tdd_spec_eloMatchmaking.md]] (rank badge source), [[tdd_spec_microLessons.md]] (XP source), [[tdd_spec_liveRankedBattles.md]] (XP source), [[tdd_spec_asyncAudioDuels.md]] (XP source), [[tdd_spec_bossBattles.md]] (XP source), [[tdd_spec_leaderboards.md]] (Post-MVP, consumes XP data)
