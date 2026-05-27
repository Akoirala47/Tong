# TDD Spec: Dynamic Leaderboards (P-06)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
Weekly and all-time leaderboards segmented by Solo XP and Ranked ELO, with global, regional, and friends-list filter scopes. Powered by Redis Sorted Sets for real-time ranking, with PostgreSQL as the source of truth for weekly snapshots.

### Leaderboard Types

| Board | Metric | Reset | Scope Options |
|-------|--------|-------|---------------|
| Ranked ELO | Current ELO | Never (all-time) | Global / Regional / Friends |
| Weekly XP | XP earned this week | Every Monday 00:00 UTC | Global / Regional / Friends |
| All-Time XP | Total XP | Never | Global / Regional / Friends |

### Redis Sorted Set Architecture

```
# Key schema
leaderboard:elo:global:{language}            → ZSET: user_id → elo_score
leaderboard:xp:weekly:global:{language}      → ZSET: user_id → xp_this_week
leaderboard:xp:alltime:global:{language}     → ZSET: user_id → xp_total
leaderboard:elo:regional:{region}:{language} → ZSET: user_id → elo_score

# Friends leaderboard is computed on-request (not cached in Redis)
# Rationale: friends lists are small; real-time sorted set maintenance is unnecessary
```

### Score Updates
- **ELO boards:** Updated synchronously within the ELO update transaction (M-07)
- **Weekly XP boards:** Updated when XP is awarded (M-09 gamification service)
- **Weekly reset:** Celery Beat task every Monday 00:00 UTC: `DEL leaderboard:xp:weekly:*` + snapshot weekly leaders to `weekly_leaderboard_snapshots` table

### Data Models

```sql
-- weekly_leaderboard_snapshots (permanent record of each week's top players)
CREATE TABLE weekly_leaderboard_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start      DATE NOT NULL,
    language        TEXT NOT NULL,
    board_type      TEXT NOT NULL,       -- 'xp_weekly'
    rank            INTEGER NOT NULL,
    user_id         UUID REFERENCES users(id),
    score           INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- user_regions (for regional leaderboard filtering)
CREATE TABLE user_regions (
    user_id         UUID PRIMARY KEY REFERENCES users(id),
    country_code    TEXT NOT NULL,       -- ISO 3166-1 alpha-2
    region          TEXT NOT NULL        -- e.g. 'APAC', 'EMEA', 'AMER'
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/leaderboards/{language}/elo` | Bearer | Global ELO board, paginated (default page=1, limit=100) |
| GET | `/leaderboards/{language}/elo?scope=regional` | Bearer | Regional ELO board |
| GET | `/leaderboards/{language}/elo?scope=friends` | Bearer | Friends ELO board (computed on-request) |
| GET | `/leaderboards/{language}/xp/weekly` | Bearer | Current week XP board |
| GET | `/leaderboards/{language}/xp/alltime` | Bearer | All-time XP board |
| GET | `/leaderboards/{language}/me/rank` | Bearer | Current user's rank on each board |

### Response Format

```json
{
  "board": "elo_global",
  "language": "es",
  "updated_at": "2026-01-15T12:34:56Z",
  "my_rank": 247,
  "my_score": 1342,
  "entries": [
    {"rank": 1, "user_id": "...", "username": "...", "avatar_url": "...", "score": 2489, "rank_tier": "Master"},
    ...
  ]
}
```

---

## 2. TDD Requirements

### Unit Tests

```python
# test_leaderboards_unit.py
def test_elo_update_writes_to_redis_sorted_set():
def test_xp_award_updates_weekly_xp_sorted_set():
def test_xp_award_updates_alltime_xp_sorted_set():
def test_weekly_reset_deletes_weekly_sorted_sets():
def test_weekly_reset_snapshots_top_100_to_db():
def test_friends_board_computed_from_friends_list_only():
def test_regional_board_filters_by_user_region():
def test_rank_is_correct_position_in_sorted_set():
def test_pagination_returns_correct_offset_slice():
```

### Integration Tests

```python
# test_leaderboards_integration.py
def test_elo_board_updates_in_real_time_after_match():
def test_weekly_xp_board_updates_after_lesson_completion():
def test_celery_beat_triggers_weekly_reset():
def test_weekly_snapshot_persisted_to_db_after_reset():
def test_friends_board_api_returns_only_friends():
def test_regional_board_api_returns_correct_region():
def test_my_rank_endpoint_returns_position_across_all_boards():
```

### E2E Tests

```
Scenario: ELO leaderboard updates after a ranked match
  Given Player A is ranked #50 globally in Spanish ELO
  When they win a match and gain +18 ELO
  Then within 5 seconds, the global ELO board reflects their new rank
  And their rank may change based on surrounding players' scores

Scenario: Weekly XP board resets on Monday
  Given the top weekly XP player at Sunday 23:59 UTC
  When Monday 00:00 UTC arrives
  Then the weekly XP board resets to zero for all players
  And their score is preserved in the weekly_leaderboard_snapshots table
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Leaderboards are the **social mirror** of Tong's competitive ecosystem. A player who can see that they are rank #247 globally in Spanish ELO has a number to protect — and a number to chase. The weekly XP board creates a short-cycle competition that resets the playing field every Monday, giving players at any ELO level a fair chance to top the weekly grind chart. The friends scope is the most psychologically powerful: being beaten by a friend in your language study group is a stronger motivational signal than being beaten by a stranger.

---

## 4. Bidirectional Links

- [features.md → P-06](../features.md)
- Related specs: [[tdd_spec_eloMatchmaking.md]] (ELO source), [[tdd_spec_gamification.md]] (XP source)
