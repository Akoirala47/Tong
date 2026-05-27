# TDD Spec: Live Ranked Voice Battles — Solo Queue (M-06)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
The core PvP product: real-time 1v1 voice-call battles with skill-based matchmaking. Players queue, are matched within ±150 MMR, receive a conversational prompt, conduct a live voice conversation in the target language for a fixed duration, and submit for post-match processing.

### Match Lifecycle
```
Queue Entry → Matchmaking → Match Found → Pre-Match Lobby (prompt reveal) → Live Battle
→ Server starts Agora Individual Cloud Recording (per-player, non-metadata_only matches only)
→ Match Concluded → Agora pushes audio directly to R2 → Post-Match Processing → Result Delivered
```

- **Match Duration:** 3 minutes (configurable per tier)
- **Queue Timeout:** 5 minutes; if no match found, player is notified and removed from queue
- **Voice Infrastructure:** Agora.io RTC channel per match (voice transport + Individual Cloud Recording for non-metadata_only matches). Scale path: **self-hosted LiveKit at ~50k MAU**, which uses the [LiveKit Egress API](https://docs.livekit.io/egress/overview/) for server-side recording — same pattern, no client changes needed. See [[tdd_spec_computeEconomics.md]].

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
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id             UUID REFERENCES live_matches(id),
    player_id            UUID REFERENCES users(id),
    agora_resource_id    TEXT,       -- Agora Cloud Recording resourceId (null if metadata_only)
    agora_sid            TEXT,       -- Agora recording session ID
    audio_url            TEXT,       -- R2 URL populated when Agora finishes uploading
    recording_status     TEXT NOT NULL DEFAULT 'not_required',
                                    -- 'not_required' | 'recording' | 'uploaded' | 'failed'
    started_at           TIMESTAMPTZ,
    uploaded_at          TIMESTAMPTZ
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
| GET | `/matches/live/{match_id}/result` | Bearer | Poll for post-match result |
| POST | `/webhooks/agora/recording` | Agora signature | Agora calls this when recording upload to R2 is complete; triggers pipeline dispatch |

### Queue & Matchmaking (Real-Time)
- Queue state managed in Redis Sorted Set: `queue:{language}` → `{user_id: mmr_score}`
- WebSocket connection maintained per queuing player for instant match notification
- Server-side matchmaking loop (Celery beat, every 2 seconds): scan queue for pairs within ±150 MMR
- On match found: create `live_matches` record, generate Agora RTC tokens, push match info to both players via WebSocket

### Agora Channel Management
- Each match gets a unique Agora channel name: `match_{match_id}`
- Server generates short-lived tokens (1-hour expiry) using Agora Token Builder SDK
- Client joins channel using the token; Agora enforces token validity
- After match concludes, server stops recording and destroys the channel via Agora REST API
- No Agora RTT — moderation and grading run post-match on the recorded audio (M-08/M-10)

### Server-Side Recording (Agora Individual Cloud Recording)

Client uploads are unreliable over 4G/3G for 3–5 min audio files — upload failure means no feedback and no ELO update, which is unacceptable for a competitive app. **Recording is handled entirely server-side via Agora's Individual Cloud Recording REST API.** The audio is already flowing through Agora's SD-RTN; we just tell Agora to save each player's stream to R2.

**Recording decision at match start:**
```python
def should_record(user_id: str) -> bool:
    """Only record if this player's pipeline will need audio (not metadata_only)."""
    sub = subscription_tier(user_id)
    if sub in ("pro", "elite"):
        return True
    if sub == "plus":
        return not monthly_coaching_cap_reached(user_id)
    # free: record only if they haven't used their daily lite yet
    return not daily_lite_cap_reached(user_id)
```

**Flow:**
1. Both players tap Ready → server calls `should_record()` per player
2. For players needing audio: server calls Agora `/acquire` → `/start` (Individual mode, one UID per player)
3. Match runs; Agora records each player's stream independently
4. `POST /matches/live/{id}/conclude` → server calls Agora `/stop` per recording resource
5. Agora uploads audio files directly to Cloudflare R2 (S3-compatible credentials)
6. Agora calls `POST /webhooks/agora/recording` when each file lands in R2
7. Webhook handler verifies Agora signature, updates `live_match_recordings.audio_url`, dispatches Celery pipeline job
8. For `metadata_only` players: pipeline dispatches immediately on conclude (no audio needed)

**LiveKit migration note (at ~50k MAU):**
When migrating from Agora to self-hosted LiveKit, replace Agora Cloud Recording with [LiveKit Egress](https://docs.livekit.io/egress/overview/) (`RoomCompositeEgress` or `TrackEgress`). The recording flow is identical from the pipeline's perspective — audio lands in R2, webhook dispatches the job. Client code requires no changes.

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
def test_should_record_returns_true_for_pro_user():
def test_should_record_returns_true_for_free_user_within_daily_cap():
def test_should_record_returns_false_for_free_user_over_daily_cap():
def test_should_record_returns_false_for_plus_user_over_monthly_cap():
def test_agora_recording_webhook_signature_validated():
def test_recording_webhook_updates_audio_url_and_dispatches_pipeline():
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
def test_conclude_from_both_players_triggers_recording_stop_and_pipeline():
def test_conclude_on_timer_expiry_auto_concludes_match():
def test_agora_recording_started_on_ready_for_non_metadata_players():
def test_agora_recording_not_started_for_metadata_only_players():
def test_recording_webhook_dispatches_celery_pipeline_job():
def test_metadata_only_player_pipeline_dispatched_immediately_on_conclude():
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
  And the server stops the Agora recording and Agora pushes audio to R2
  And they see a "Processing..." screen while grading runs (no upload step)
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
