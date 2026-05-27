# TDD Spec: Squad Queues — Duo / Trio / Quad (P-05)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
Extends live ranked battles (M-06) from 1v1 Solo queue to support 2v2 (Duo), 3v3 (Trio), and 4v4 (Quad) party matches. Friends form a party, queue together, and are matched against an opposing party of the same size. Conversational prompts become multi-participant scenarios (debates, group roleplays). ELO is averaged across the party for matchmaking.

### Party System Architecture

```
Party Leader creates party → invites friends → party joins queue → matchmaking → 2-party match created
```

- **Party MMR:** Average MMR of all party members (simple mean, no weighted variance at MVP)
- **Queue:** Separate Redis sorted sets per queue type: `queue:es:duo`, `queue:es:trio`, `queue:es:quad`
- **Match Structure:** Two opposing parties in the same Agora channel (all members can hear all members)
- **Grading:** Treated as team vs team; winning side determined by aggregate DeepSeek scores across all members

### Data Models

```sql
-- parties
CREATE TABLE parties (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_id       UUID REFERENCES users(id),
    language        TEXT NOT NULL,
    queue_type      TEXT NOT NULL,       -- 'duo' | 'trio' | 'quad'
    status          TEXT NOT NULL DEFAULT 'forming',
                                         -- 'forming' | 'queuing' | 'in_match' | 'disbanded'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- party_members
CREATE TABLE party_members (
    party_id        UUID REFERENCES parties(id),
    user_id         UUID REFERENCES users(id),
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (party_id, user_id)
);

-- party_invites
CREATE TABLE party_invites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id        UUID REFERENCES parties(id),
    inviter_id      UUID REFERENCES users(id),
    invitee_id      UUID REFERENCES users(id),
    status          TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'accepted' | 'declined'
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- squad_matches (extends live_matches concept for multi-player)
CREATE TABLE squad_matches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party1_id       UUID REFERENCES parties(id),
    party2_id       UUID REFERENCES parties(id),
    language        TEXT NOT NULL,
    queue_type      TEXT NOT NULL,
    prompt_text     TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'lobby',
    agora_channel   TEXT NOT NULL,
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    winner_party_id UUID REFERENCES parties(id)
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/parties` | Bearer | Create a party (become leader) |
| POST | `/parties/{party_id}/invite` | Bearer | Invite a friend to the party |
| POST | `/parties/invites/{invite_id}/respond` | Bearer | Accept or decline an invite |
| DELETE | `/parties/{party_id}/leave` | Bearer | Leave the party (leader transfers or disbands) |
| POST | `/parties/{party_id}/queue` | Bearer | Enter queue (leader only) |
| DELETE | `/parties/{party_id}/queue` | Bearer | Leave queue (leader only) |
| GET | `/parties/{party_id}` | Bearer | Get party state and members |
| GET | `/squad-matches/{match_id}` | Bearer | Get squad match details |

### Agora Multi-Party Channel
- All members of both parties join the same Agora channel
- Server mutes all players until both parties tap Ready
- After match: each player's audio track is recorded separately for individual post-match analysis
- ELO is calculated per-player, not per-party (win/loss is team-level; ELO delta is individual)

---

## 2. TDD Requirements

### Unit Tests

```python
# test_squad_queues_unit.py
def test_party_mmr_is_average_of_all_members():
def test_party_size_limited_to_queue_type_max():
def test_leader_can_invite_to_party():
def test_non_leader_cannot_start_queue():
def test_leader_leaving_transfers_leadership_to_next_member():
def test_leader_leaving_if_last_member_disbands_party():
def test_party_invite_expires_after_configured_time():
def test_duo_queue_matches_parties_of_size_2_only():
def test_matchmaking_pairs_parties_within_avg_mmr_range():
def test_elo_calculated_per_individual_not_per_party():
```

### Integration Tests

```python
# test_squad_queues_integration.py
def test_create_party_sets_leader_as_member():
def test_accepted_invite_adds_member_to_party():
def test_declined_invite_does_not_change_party():
def test_party_enters_correct_redis_queue_on_queue():
def test_matchmaking_creates_squad_match_for_two_parties():
def test_websocket_delivers_match_found_to_all_party_members():
def test_post_match_pipeline_runs_for_each_player_individually():
def test_elo_updated_individually_for_all_players():
def test_all_party_members_notified_of_match_result():
```

### E2E Tests

```
Scenario: Duo party forms and completes a match
  Given Player A creates a Duo party and invites Player B
  And Player B accepts the invite
  When the party leader enters the Duo queue
  And they are matched against another Duo party
  Then all 4 players enter the same Agora voice channel
  And after the match, each player receives individual feedback and ELO updates

Scenario: Party leader leaves mid-queue
  Given a Trio party in the queue
  When the leader leaves the party
  Then leadership transfers to the next member
  And the party remains in queue
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Solo ranked matches require individual courage. Squad matches require **coordinated courage** — the ability to speak, listen, and respond in a target language while your teammates are simultaneously doing the same. This is a fundamentally different and more advanced skill: real-world conversations are rarely 1v1. The squad queue introduces a social recruitment mechanic (invite a friend → they download Tong → growth loop) while simultaneously raising the ceiling of what Tong tests. A Quad match is as close to a real group conversation as a competitive language app can manufacture.

---

## 4. Bidirectional Links

- [features.md → P-05](../features.md)
- Related specs: [[tdd_spec_liveRankedBattles.md]] (base match system), [[tdd_spec_eloMatchmaking.md]] (ELO per-player), [[tdd_spec_postMatchPipeline.md]] (per-player audio processing), [[tdd_spec_dynamicPrompts.md]] (multi-player prompt variant)
