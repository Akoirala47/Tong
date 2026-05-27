# TDD Spec: Live Ranked Voice Battles — Solo Queue (M-06)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
The core PvP product: real-time 1v1 voice-call battles with skill-based matchmaking. Players queue, are matched within ±150 MMR, receive a conversational prompt, conduct a live voice conversation in the target language for a fixed duration, and submit for post-match processing.

### Match Lifecycle
```
Queue Entry → Matchmaking → Match Found → Pre-Match Lobby (prompt reveal) → Live Battle → Match Concluded → Audio Upload → Post-Match Processing → Result Delivered
```

- **Match Duration:** 3 minutes (configurable per tier)
- **Queue Timeout:** 5 minutes; if no match found, player is notified and removed from queue
- **Voice Infrastructure:** Agora.io RTC channel per match (**voice transport only** — no cloud recording, no RTT). Scale path: self-hosted LiveKit at ~50k MAU. See [[tdd_spec_computeEconomics.md]].

### Data Models

```sql
-- live_matches
CREATE TABLE live_matches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id      UUID REFERENCES users(id),
    player2_id      UUID REFERENCES users(id),
    language        TEXT NOT NULL,
    prompt_text     TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'lobby',
                                    -- 'lobby' | 'active' | 'concluded' | 'processing' | 'completed'
    agora_channel   TEXT NOT NULL,  -- unique channel name for Agora RTC
    agora_token_p1  TEXT,           -- short-lived RTC token for player 1
    agora_token_p2  TEXT,           -- short-lived RTC token for player 2
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- live_match_recordings
CREATE TABLE live_match_recordings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id        UUID REFERENCES live_matches(id),
    player_id       UUID REFERENCES users(id),
    audio_url       TEXT,           -- R2 URL uploaded post-match
    uploaded_at     TIMESTAMPTZ
);

-- live_match_results
CREATE TABLE live_match_results (
    match_id        UUID PRIMARY KEY REFERENCES live_matches(id),
    winner_id       UUID REFERENCES users(id),
    elo_delta_p1    INTEGER,
    elo_delta_p2    INTEGER,
    feedback_p1     JSONB,
    feedback_p2     JSONB,
    graded_at       TIMESTAMPTZ
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/matches/live/queue` | Bearer | Enter the matchmaking queue |
| DELETE | `/matches/live/queue` | Bearer | Leave the queue |
| GET | `/matches/live/queue/status` | Bearer | Poll queue status (or use WebSocket) |
| GET | `/matches/live/{match_id}` | Bearer | Get match details including prompt and Agora tokens |
| POST | `/matches/live/{match_id}/ready` | Bearer | Signal player is ready in lobby |
| POST | `/matches/live/{match_id}/conclude` | Bearer | Signal match end (both players must call, or server auto-concludes on timer) |
| POST | `/matches/live/{match_id}/upload` | Bearer | Pre-signed R2 URL for audio upload |
| GET | `/matches/live/{match_id}/result` | Bearer | Poll for post-match result |

### Queue & Matchmaking (Real-Time)
- Queue state managed in Redis Sorted Set: `queue:{language}` → `{user_id: mmr_score}`
- WebSocket connection maintained per queuing player for instant match notification
- Server-side matchmaking loop (Celery beat, every 2 seconds): scan queue for pairs within ±150 MMR
- On match found: create `live_matches` record, generate Agora RTC tokens, push match info to both players via WebSocket

### Agora Channel Management
- Each match gets a unique Agora channel name: `match_{match_id}`
- Server generates short-lived tokens (1-hour expiry) using Agora Token Builder SDK
- Client joins channel using the token; Agora enforces token validity
- After match concludes, channel is destroyed server-side via Agora REST API
- **No Agora Cloud Recording or RTT** — moderation and grading use R2 uploads + worker pipeline (M-08/M-10)

### Client-Side Recording
- While in the Agora channel, client records the full session locally using `expo-av`
- After `conclude` signal, client uploads the raw audio to R2 via pre-signed URL
- Upload triggers tiered post-match Celery dispatch via `resolve_pipeline_tier()` (see [[tdd_spec_postMatchPipeline.md]])

---

## 2. TDD Requirements

### Unit Tests

```python
# test_live_battles_unit.py
def test_agora_token_generated_with_correct_channel_name():
def test_agora_token_expires_within_1_hour():
def test_match_status_transitions_are_valid():
    # lobby → active → concluded → processing → completed
def test_invalid_status_transition_raises_error():
    # e.g. concluded → lobby
def test_queue_entry_stores_mmr_in_sorted_set():
def test_queue_removal_cleans_up_sorted_set():
def test_match_found_requires_both_players_within_150_mmr():
def test_queue_timeout_removes_player_after_5_minutes():
```

### Integration Tests

```python
# test_live_battles_integration.py
def test_entering_queue_adds_player_to_redis_sorted_set():
def test_leaving_queue_removes_player_from_redis():
def test_matchmaking_pairs_two_players_within_mmr_range():
def test_matchmaking_creates_live_match_record():
def test_websocket_delivers_match_found_event_to_both_players():
def test_both_players_ready_transitions_match_to_active():
def test_conclude_from_both_players_triggers_processing():
def test_conclude_on_timer_expiry_auto_concludes_match():
def test_upload_url_is_scoped_to_correct_player_and_match():
def test_result_endpoint_returns_404_while_processing():
def test_result_endpoint_returns_data_after_grading_complete():
```

### E2E Tests

```
Scenario: Full live match flow
  Given two players in the queue within MMR range
  When the matchmaking loop finds them
  Then both receive a "Match Found" screen with the prompt
  And both tap Ready to enter the live call
  And they can hear each other via Agora voice channel
  And after 3 minutes the match concludes automatically
  And both are prompted to upload their recordings
  And they see a "Processing..." screen while grading runs
  And a result screen with ELO change appears within 60 seconds

Scenario: Queue timeout
  Given a player who enters the queue
  When no opponent is found within 5 minutes
  Then they receive a "No match found" notification
  And are removed from the queue automatically

Scenario: Player disconnects mid-match
  Given an active live match
  When Player 1 loses their network connection
  Then the Agora channel handles reconnection for 30 seconds
  And if they do not reconnect, Player 2 wins by default
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The live ranked battle is the **pinnacle of productive discomfort**. Unlike lessons (passive practice) and async duels (deliberate reflection), the live match gives the player no time to think, no chance to re-record, and a real human opponent responding in real-time. The ELO system ensures the opponent is always at the player's exact level — not a mercy match, not a stomp. Every match is a fair test of the player's current fluency under real-time pressure. The prompt reveal in the lobby (not before) gives only seconds of mental preparation, replicating the unscripted nature of real conversations.

---

## 4. Bidirectional Links

- [features.md → M-06](../features.md)
- Related specs: [[tdd_spec_eloMatchmaking.md]] (matchmaking algorithm), [[tdd_spec_postMatchPipeline.md]] (grading), [[tdd_spec_toxicityModeration.md]] (post-match safety), [[tdd_spec_computeEconomics.md]] (RTC phasing), [[tdd_spec_squadQueues.md]] (Post-MVP extension)
