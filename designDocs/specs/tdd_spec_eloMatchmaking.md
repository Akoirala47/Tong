# TDD Spec: ELO & Matchmaking System (M-07)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
A two-layer rating system: a **visible ELO rank** (displayed on profile, tied to tier badge) and a **hidden MMR** (used for matchmaking precision). Both are updated post-match. The matchmaking algorithm pairs players from the same queue within ±150 MMR, expanding the search window over time.

### ELO Formula
Standard Elo with K-factor tuning by rank tier:

```
Expected Score: E_a = 1 / (1 + 10^((R_b - R_a) / 400))
New Rating:     R_a' = R_a + K * (S_a - E_a)
```

Where:
- `S_a` = actual match score (1 = win, 0.5 = draw, 0 = loss)
- `K` = K-factor based on rank tier (Bronze: 32, Silver: 28, Gold: 24, Platinum: 20, Diamond+: 16)
- Async Duel ELO delta = 25% of standard match delta (micro-ELO)

### Rank Tiers

| Tier | ELO Range | K-Factor |
|------|-----------|----------|
| Bronze | 0 – 999 | 32 |
| Silver | 1000 – 1199 | 28 |
| Gold | 1200 – 1499 | 24 |
| Platinum | 1500 – 1799 | 20 |
| Diamond | 1800 – 2099 | 16 |
| Master | 2100+ | 16 |

### MMR vs ELO
- **MMR** (hidden): updated using same Elo formula, but with K=32 always. Used exclusively for matchmaking. Tracks true skill without the display-tier politics.
- **ELO** (visible): same formula, K varies by tier. Drives the profile rank display, leaderboard, and tier badge.
- Both start at 1000 on account creation.

### Data Models

```sql
-- elo_history (append-only audit log)
CREATE TABLE elo_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    source_type     TEXT NOT NULL,   -- 'live_match' | 'async_duel'
    source_id       UUID NOT NULL,   -- match_id or duel_id
    elo_before      INTEGER NOT NULL,
    elo_after       INTEGER NOT NULL,
    mmr_before      INTEGER NOT NULL,
    mmr_after       INTEGER NOT NULL,
    delta           INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- rank_tier_history (track promotions and demotions)
CREATE TABLE rank_tier_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    from_tier       TEXT,
    to_tier         TEXT NOT NULL,
    elo_at_change   INTEGER NOT NULL,
    changed_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/elo/me` | Bearer | Current ELO, MMR, rank tier, and recent history |
| GET | `/elo/{user_id}` | None | Public ELO and rank for any user |
| GET | `/elo/me/history` | Bearer | Paginated ELO change history |
| POST | `/elo/calculate` | Internal | Calculate ELO delta for a match outcome (called by worker) |

### Rank Tier Promotion/Demotion
- **Promotion:** When ELO crosses the upper threshold of current tier
- **Demotion:** When ELO drops below the lower threshold, except floor at 0 (no negative ELO)
- Promotion/demotion events write to `rank_tier_history` and push a notification to the user
- **Promotion shield:** 3 matches after promotion, cannot be demoted (prevents yo-yo effect)

### ELO Updates by Pipeline Tier
- **`lite` / `full` / `elite` / `elite_phoneme`:** Winner from DeepSeek grading (or draw logic)
- **`metadata_only`:** ELO delta from match metadata (duration, engagement, forfeit) — no transcript required
- All tiers award XP via gamification (M-09)

### Matchmaking Window Expansion
```
Queue age 0-60s:   ±150 MMR
Queue age 60-120s: ±250 MMR
Queue age 120-240s: ±400 MMR
Queue age 240s+:   ±600 MMR (then queue timeout at 300s)
```
Expansion tracked per player in Redis: `queue_entry:{user_id}` → `{mmr, entered_at}`

---

## 2. TDD Requirements

### Unit Tests

```python
# test_elo_unit.py
def test_elo_expected_score_equal_ratings_is_0_5():
def test_elo_expected_score_higher_rated_opponent():
def test_elo_expected_score_lower_rated_opponent():
def test_elo_delta_win_against_equal_opponent_is_k_half():
def test_elo_delta_loss_against_equal_opponent_is_negative_k_half():
def test_elo_delta_win_against_stronger_opponent_exceeds_k_half():
def test_elo_delta_loss_against_weaker_opponent_less_than_negative_k_half():
def test_k_factor_is_32_for_bronze():
def test_k_factor_is_16_for_diamond():
def test_async_duel_delta_is_25_percent_of_standard():
def test_elo_floor_at_zero():
def test_rank_tier_bronze_below_1000():
def test_rank_tier_silver_1000_to_1199():
def test_rank_tier_master_above_2100():
def test_promotion_shield_prevents_demotion_within_3_matches():
def test_mmr_always_uses_k32_regardless_of_tier():

def test_matchmaking_window_150_at_0_seconds():
def test_matchmaking_window_250_at_90_seconds():
def test_matchmaking_window_600_at_270_seconds():
```

### Integration Tests

```python
# test_elo_integration.py
def test_elo_update_writes_to_history_table():
def test_elo_update_updates_profiles_table():
def test_promotion_event_writes_to_rank_tier_history():
def test_demotion_event_writes_to_rank_tier_history():
def test_promotion_push_notification_sent():
def test_demotion_blocked_during_promotion_shield():
def test_elo_history_endpoint_is_paginated():
def test_mmr_updated_independently_of_elo():
```

### E2E Tests

```
Scenario: ELO update after live match
  Given two players complete a live match
  When the post-match pipeline finishes grading
  Then both players' ELO and MMR are updated correctly
  And the ELO history reflects the change
  And the profile rank badge updates if a tier threshold was crossed

Scenario: Rank promotion notification
  Given a Silver player at ELO 1195
  When they win a match and gain +10 ELO
  Then their tier updates to Gold (ELO 1205)
  And they receive a "Promoted to Gold!" push notification
  And their profile banner changes to the Gold rank badge
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The ELO system is the **engine of fair pressure**. Without skill-based matchmaking, the ranked arena would devolve into stomps (demoralizing) or unchallenging wins (boring). The hidden MMR / visible ELO split allows matchmaking to seek true parity while the visible rank preserves the psychological satisfaction of earned status. The K-factor taper at higher tiers slows rank inflation, ensuring that Diamond and Master rank genuinely mean something. The promotion shield prevents demotion anxiety from making players unwilling to queue after a promotion — keeping the pressure productive rather than paralyzing.

---

## 4. Bidirectional Links

- [features.md → M-07](../features.md)
- Related specs: [[tdd_spec_liveRankedBattles.md]] (queue), [[tdd_spec_asyncAudioDuels.md]] (micro-ELO), [[tdd_spec_gamification.md]] (rank badge display), [[tdd_spec_leaderboards.md]] (Post-MVP)
