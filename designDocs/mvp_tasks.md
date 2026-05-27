# Tong MVP Task Breakdown — Two-Developer Parallel Plan

> **Dev A:** Backend (FastAPI, DB migrations, Celery workers, Agora server, Redis, R2)
> **Dev B:** Mobile (React Native, Expo, screens, audio, Agora RTC client)
>
> **Gate** = explicit sync point where Dev B must wait for Dev A before integrating.
> Dev B builds against mock/stub responses until each gate is cleared.
>
> See [features.md](./features.md) | [tech_stack.md](./tech_stack.md) | [tdd_spec_computeEconomics.md](./specs/tdd_spec_computeEconomics.md)

---

## Sprint 0 — Foundation (Both devs, Day 1, fully parallel)

### Dev A
- [ ] **A-F01** — Initialize monorepo: `apps/api/`, `workers/`, `infra/`
- [ ] **A-F02** — Configure Railway project: Postgres, Redis, API service, Worker service
- [ ] **A-F03** — Write `Dockerfile` for FastAPI API service (Uvicorn entrypoint)
- [ ] **A-F04** — Write `Dockerfile` for Celery worker; shared `requirements.txt` with API
- [ ] **A-F05** — Set up Alembic; write initial empty migration; verify `alembic upgrade head` runs clean
- [ ] **A-F06** — Configure pytest with `pytest-asyncio`, per-test DB isolation, factory fixtures
- [ ] **A-F07** — Set up Cloudflare R2 bucket; verify pre-signed upload + public download from API

### Dev B
- [ ] **B-F01** — Initialize `apps/mobile/` with Expo + React Native + TypeScript strict mode
- [ ] **B-F02** — Set up ESLint, Prettier, path aliases (`@/components`, `@/screens`, etc.)
- [ ] **B-F03** — Set up React Navigation (bottom tabs + stack navigator skeleton)
- [ ] **B-F04** — Build `MockApiClient` — a local stub that returns hardcoded fixtures for every endpoint; all screens use this until gates clear
- [ ] **B-F05** — Set up Expo push notification handler skeleton (receive + display notification)

---

## M-01 — User Authentication & Profile

### Dev A
- [ ] **A-M01-01** — Migration: `users`, `profiles`, `oauth_providers` tables
- [ ] **A-M01-02** — Unit tests: bcrypt hashing, JWT generation/validation, rank tier from ELO
- [ ] **A-M01-03** — `POST /auth/register` — email + password, bcrypt hash, create user + profile
- [ ] **A-M01-04** — `POST /auth/login` — validate credentials, return JWT access + Redis refresh token
- [ ] **A-M01-05** — `POST /auth/refresh` + `POST /auth/logout` — token rotation, Redis invalidation
- [ ] **A-M01-06** — Supabase Auth OAuth: `POST /auth/oauth/google` + `/apple` redirect + callback
- [ ] **A-M01-07** — `GET /users/me`, `PATCH /users/me`, `GET /users/{username}` (public, no email)
- [ ] **A-M01-08** — Integration tests: register, login, refresh, logout, duplicate email, public profile

> **🔒 Gate M-01:** Dev B integrates real auth after A-M01-04 is deployed.

### Dev B
- [ ] **B-M01-01** — Registration screen (email, username, password, target language picker)
- [ ] **B-M01-02** — Login screen + "Continue with Google / Apple" OAuth buttons
- [ ] **B-M01-03** — JWT storage (Expo SecureStore); auto-refresh interceptor in API client
- [ ] **B-M01-04** — Own profile screen: avatar, display name, rank badge, XP bar, streak
- [ ] **B-M01-05** — Public profile screen (read-only): rank badge, ELO, win/loss history
- [ ] **B-M01-06** — E2E smoke test: register → profile visible → logout → login again

---

## M-02 — Solo Grind: Micro-Lessons

### Dev A
- [ ] **A-M02-01** — Migration: `content_tiers`, `lessons`, `exercise_cards`, `user_lesson_progress`, `user_card_responses`
- [ ] **A-M02-02** — Seed: Spanish Bronze tier — 3 chapters, ~30 exercise cards (translate, multiple_choice, fill_blank)
- [ ] **A-M02-03** — Unit tests: answer validation (exact, case-insensitive, whitespace), XP per try
- [ ] **A-M02-04** — `GET /lessons/current`, `GET /lessons/{id}`, `GET /lessons/tier/{tier}`
- [ ] **A-M02-05** — `POST /lessons/{id}/cards/{card_id}/answer` — validate, return result + XP delta; wrong answer calls flashcard inject
- [ ] **A-M02-06** — `POST /lessons/{id}/complete` — compute score, award XP, unlock next lesson
- [ ] **A-M02-07** — Integration tests: lesson fetch, answer submission, tier-gating (Silver inaccessible to Bronze)

> **🔒 Gate M-02:** Dev B integrates lesson API after A-M02-04 + A-M02-05 are deployed.

### Dev B
- [ ] **B-M02-01** — Solo Grind home screen: chapter list, locked/unlocked state, progress rings
- [ ] **B-M02-02** — Lesson screen: card-by-card interface; translate/fill-blank/multiple-choice card types; correct/incorrect animation
- [ ] **B-M02-03** — Lesson summary screen: score, XP earned, weak words callout
- [ ] **B-M02-04** — Wire lesson completion to XP counter update in header

---

## M-03 — Solo Grind: Intelligent Flashcards

### Dev A
- [ ] **A-M03-01** — Migration: `flashcard_items`, `user_flashcard_queue`
- [ ] **A-M03-02** — Unit tests: SM-2 interval/ease calculation for all quality levels (0–5), next review date, ease factor bounds
- [ ] **A-M03-03** — Pure function `compute_next_review(interval, ease, quality)` — no DB side effects
- [ ] **A-M03-04** — `POST /flashcards/inject` (internal) — upsert; reset interval on duplicate
- [ ] **A-M03-05** — `GET /flashcards/due`, `POST /flashcards/{id}/review`, `GET /flashcards/queue/stats`
- [ ] **A-M03-06** — Integration tests: inject from lesson wrong answer, review correct/incorrect, deduplication

> **🔒 Gate M-03:** Dev B integrates after A-M03-05 is deployed.

### Dev B
- [ ] **B-M03-01** — Flashcard swipe screen: swipe right (knew it) / left (missed it), card flip animation
- [ ] **B-M03-02** — Flashcard queue dashboard: cards due count, next review countdown, session complete screen

---

## M-04 — Solo Grind: Boss Battles

### Dev A
- [ ] **A-M04-01** — Migration: `boss_battles`, `user_boss_battle_attempts`, `user_tier_unlocks`
- [ ] **A-M04-02** — Seed: Spanish Bronze Boss Battle record
- [ ] **A-M04-03** — Unit tests: score calculation, cooldown progression (24h/48h/72h), server-side timer enforcement
- [ ] **A-M04-04** — `GET /boss-battles/current` — eligibility + cooldown status
- [ ] **A-M04-05** — `POST /boss-battles/{id}/start` — record `started_at`, return randomized question set
- [ ] **A-M04-06** — `POST /boss-battles/{id}/submit` — server validates timer; pass → tier unlock; fail → cooldown
- [ ] **A-M04-07** — Integration tests: pass (tier unlock), fail (cooldown), late submission (answers after grace discarded)

> **🔒 Gate M-04:** Dev B integrates after A-M04-04 + A-M04-06 are deployed.

### Dev B
- [ ] **B-M04-01** — Boss Battle screen: countdown timer (display-only), sequential question cards, submit on timer expiry
- [ ] **B-M04-02** — Victory screen ("Tier Cleared!") + failure screen ("Not Yet" — score + cooldown timer)
- [ ] **B-M04-03** — Unlock animation: Silver tier chapters appear in Solo Grind home after passing

---

## M-05 — Async Audio Duels

### Dev A
- [ ] **A-M05-01** — Migration: `async_duels`, `async_duel_moves`, `async_duel_results`
- [ ] **A-M05-02** — Unit tests: turn advancement, forfeit detection, free tier cap (3 duels), audio duration rejection
- [ ] **A-M05-03** — `POST /duels/async/queue` — match within ±150 ELO, create duel, assign prompt
- [ ] **A-M05-04** — `GET /duels/async/active`, `GET /duels/async/{id}`, `POST /duels/async/{id}/forfeit`, `GET /duels/async/{id}/result`
- [ ] **A-M05-05** — `POST /duels/async/{id}/move` — issue pre-signed R2 upload URL; on confirmation, advance turn + reset `expires_at`
- [ ] **A-M05-06** — Celery beat task (every 5 min): forfeit expired duels, notify both players
- [ ] **A-M05-07** — Free tier cap check (3 active duels) → 403 in queue endpoint
- [ ] **A-M05-08** — Integration tests: full turn cycle, forfeit on timeout, cap enforcement
- [ ] **A-M05-09** — On duel completion: dispatch `process_match` with `source_type=async_duel` → `metadata_only` tier for free users (paid-tier-ready via `subscription_tier()` stub returning 'free' until P-07)

> **🔒 Gate M-05:** Dev B integrates after A-M05-03 + A-M05-05 are deployed.

### Dev B
- [ ] **B-M05-01** — Set up push notification dispatch integration (Expo Push API); test on physical device
- [ ] **B-M05-02** — Async Duels home screen: active duels list, turn indicator badge, "Your turn" highlight
- [ ] **B-M05-03** — Duel screen: prompt display, opponent audio playback, record + submit interface (`expo-av`; enforce 90s max)
- [ ] **B-M05-04** — Duel result screen: winner announcement, ELO delta; metadata-only for free (no feedback paragraphs until P-07 Pro)
- [ ] **B-M05-05** — E2E test: full 3-round duel from queue through result notification

---

## M-06 — Live Ranked Voice Battles

### Dev A
- [ ] **A-M06-01** — Migration: `live_matches`, `live_match_recordings`, `live_match_results`
- [ ] **A-M06-02** — Agora account setup; integrate Agora Token Builder SDK; validate token generation for a test channel
- [ ] **A-M06-03** — Unit tests: Agora token expiry, match status transition validity
- [ ] **A-M06-04** — WebSocket endpoint `WS /matches/live/queue` — client holds connection; server pushes "match found"
- [ ] **A-M06-05** — `POST /matches/live/queue` + `DELETE /matches/live/queue` — Redis sorted set management
- [ ] **A-M06-06** — Celery beat (2s): scan queue, pair within MMR window, create match, generate Agora tokens, push to both WebSockets
- [ ] **A-M06-07** — `GET /matches/live/{id}`, `POST /matches/live/{id}/ready`, `POST /matches/live/{id}/conclude`
- [ ] **A-M06-08** — `POST /matches/live/{id}/upload` — pre-signed R2 URL for audio upload
- [ ] **A-M06-10** — Integration tests: queue entry, matchmaking pairing, full match state machine

> **🔒 Gate M-06:** Dev B integrates after A-M06-04 + A-M06-07 are deployed (Dev B can use a local Agora test channel before this).

### Dev B
- [ ] **B-M06-01** — Install `react-native-agora`; test joining a hardcoded channel on physical device (voice in/out confirmed)
- [ ] **B-M06-02** — Queue screen: "Finding opponent…" with MMR window expansion indicator + cancel button
- [ ] **B-M06-03** — WebSocket client: connect on queue entry, handle "match found" event, navigate to lobby
- [ ] **B-M06-04** — Lobby screen: prompt reveal, both player profiles/ranks, Ready button
- [ ] **B-M06-05** — Live battle screen: Agora voice call UI (mute toggle, match timer, end match button); local audio recording in parallel via `expo-av`
- [ ] **B-M06-06** — Post-battle upload screen: compress + upload recording to pre-signed R2 URL; "Uploading…" → "Analyzing…" state
- [ ] **B-M06-07** — E2E test: two simulators queue, match, conclude, upload, reach result screen

---

## M-07 — ELO & Matchmaking System

*Largely backend. Dev B gets rank/ELO display on profile and result screens — depends on M-01 and M-06 screen work already done.*

### Dev A
- [ ] **A-M07-01** — Migration: `elo_history`, `rank_tier_history`
- [ ] **A-M07-02** — Unit tests: Elo formula, K-factor per tier, 25% async delta, rank tier boundaries, promotion shield
- [ ] **A-M07-03** — Pure function `calculate_elo_delta(elo_a, elo_b, outcome, tier)` — no DB side effects
- [ ] **A-M07-04** — `update_elo(user_id, delta, source_type, source_id)` — DB transaction: update `profiles`, append `elo_history`, check tier change
- [ ] **A-M07-05** — Promotion/demotion: write `rank_tier_history`, dispatch push notification
- [ ] **A-M07-06** — Promotion shield: store in Redis; block demotion for 3 post-promotion matches
- [ ] **A-M07-07** — MMR window expansion: store `queue_entry:{user_id}` with `entered_at`; matchmaking task reads for window
- [ ] **A-M07-08** — `GET /elo/me`, `GET /elo/{user_id}`, `GET /elo/me/history` (paginated)
- [ ] **A-M07-09** — Integration tests: ELO update writes history, promotion triggers notification, shield blocks demotion

### Dev B
- [ ] **B-M07-01** — Update profile screen: ELO history chart (last 10 matches, line graph)
- [ ] **B-M07-02** — Promotion/demotion push notification handler: full-screen rank-up animation

---

## M-08 — Post-Match Processing Pipeline

> Tier rules: [tdd_spec_computeEconomics.md](./specs/tdd_spec_computeEconomics.md)

### Dev A
- [ ] **A-M08-01** — Migration: `processing_jobs` (incl. `pipeline_tier`, `analysis_type`, `queue_type`, `user_id`), `transcripts`
- [ ] **A-M08-02** — Unit tests: tier resolver (free only — lite/metadata_only paths), whisper-small output parsing, lite DeepSeek JSON validation, WPM calculation, free-tier daily cap logic
- [ ] **A-M08-03** — `resolve_pipeline_tier()` + `dispatch_processing_job()` — free-tier paths only (lite/metadata_only); Pro/Plus/Elite paths stubbed and return correct tier but full/elite worker implementation deferred to P-07
- [ ] **A-M08-04** — Celery task `process_match(source_id, source_type, tier)` — chains stages by tier
- [ ] **A-M08-05** — Stage 1: faster-whisper + `whisper-small` CPU for `lite` tier; VAD silence trim; metadata_only skips this stage
- [ ] **A-M08-06** — Stage 2: DeepSeek grading — lite prompt template only in MVP (full/elite prompts implemented in P-07)
- [ ] **A-M08-07** — Stage 3: call `update_elo` (full path: DeepSeek winner; metadata path: duration/engagement)
- [ ] **A-M08-08** — Stage 4: flashcard inject (skip for `metadata_only`)
- [ ] **A-M08-09** — Stage 5: write results table, update match status → 'completed', push notification
- [ ] **A-M08-10** — Metadata-only path: skip ASR/DeepSeek; ELO-only result for free 2nd+ live match + all free async
- [ ] **A-M08-11** — Free-tier daily cap: 1 lite job/user/day; count `pipeline_tier IN ('lite')` for today
- [ ] **A-M08-12** — Celery queues: `standard` (CPU/free) only in MVP; `qwen` + `elite_gpu` queues scaffolded but empty until P-07
- [ ] **A-M08-13** — Retry policy: 3 retries, exponential backoff; on final failure → 'failed' + push notification
- [ ] **A-M08-14** — `GET /matches/live/{id}/result` — 404 while processing, result on completion
- [ ] **A-M08-15** — Integration tests: all pipeline tiers, free-tier cap, metadata-only async, retry on Whisper failure

> **🔒 Gate M-08:** Dev B builds result screen against mock data; integrates real results after A-M08-09 + A-M08-14 are deployed.

### Dev B
- [ ] **B-M08-01** — Match result screen: WPM + feedback (lite/full), ELO change animation, weak words list
- [ ] **B-M08-02** — Metadata-only result variant: ELO only + "Upgrade for full breakdown" CTA
- [ ] **B-M08-03** — Poll `GET /matches/live/{id}/result` every 3s while in "Analyzing…" state; navigate on completion
- [ ] **B-M08-04** — "Processing failed" error state with retry prompt

---

## M-09 — Gamification & Progression

### Dev A
- [ ] **A-M09-01** — Migration: `xp_events`, `streak_shields`, `daily_activity_log`
- [ ] **A-M09-02** — Unit tests: XP level formula, streak increment/reset, shield earn/consume, perfect lesson bonus
- [ ] **A-M09-03** — `POST /gamification/xp` (internal) — append `xp_events`, update `profiles.xp_total`
- [ ] **A-M09-04** — `POST /gamification/streak/check` (internal) — update `daily_activity_log`, increment/reset streak, check 7-day shield milestone
- [ ] **A-M09-05** — `GET /gamification/me` — XP total, level, streak, shields, last 10 XP events
- [ ] **A-M09-06** — Wire XP calls into: lesson completion (M-02), boss battle victory (M-04), match win/loss (M-08), duel win/loss (M-05)
- [ ] **A-M09-07** — Wire streak check into: login, lesson complete, flashcard session, match completion
- [ ] **A-M09-08** — Integration tests: XP from lesson, streak increments, shield earned at day 7

### Dev B
- [ ] **B-M09-01** — XP progress bar component (reusable; header + profile)
- [ ] **B-M09-02** — Level-up animation (fires when XP crosses a level threshold)
- [ ] **B-M09-03** — Streak display with shield indicator; "Streak at risk" warning if no activity by 20:00
- [ ] **B-M09-04** — Streak loss + shield activation animations

---

## M-10 — Toxicity Moderation

> Post-match scan (no Agora RTT). See [tdd_spec_toxicityModeration.md](./specs/tdd_spec_toxicityModeration.md).

*Entirely backend. Dev B adds post-match warning notification (no in-match mute toast in MVP).*

### Dev A
- [ ] **A-M10-01** — Migration: `moderation_events`, `user_bans`
- [ ] **A-M10-02** — Unit tests: keyword filter (exact + phonetic variants, case-insensitive), detoxify threshold, enforcement escalation (warning → 24h ban → 7d ban)
- [ ] **A-M10-03** — Seed banned term list per language as a config file (hot-reloadable)
- [ ] **A-M10-04** — Install `detoxify`; implement `classify_toxicity(text) → ToxicityResult`
- [ ] **A-M10-05** — Stage 1b Celery task: scan transcript after Whisper; skip for `metadata_only` tier
- [ ] **A-M10-06** — Enforcement: write `moderation_events`; issue warning/ban per offense history
- [ ] **A-M10-07** — `GET /moderation/events`, `PATCH /moderation/events/{id}` (admin), `POST /moderation/ban/{user_id}`
- [ ] **A-M10-08** — Ban check at queue entry (`POST /matches/live/queue` returns 403 if banned)
- [ ] **A-M10-09** — Integration tests: flagged transcript creates event, banned user blocked from queue, scan skipped for metadata_only

### Dev B
- [ ] **B-M10-01** — Post-match warning notification: push/in-app when user receives moderation warning after match

---

## MVP Completion Checklist

- [ ] End-to-end flow validated by both devs together: register → solo lesson → boss battle → async duel → live match → result screen
- [ ] All unit + integration tests green on CI
- [ ] Post-match toxicity scan tested on real uploaded audio (lite pipeline)
- [ ] Free-tier gate validated: second match of the day returns ELO-only metadata result
- [ ] Free async duel validated: metadata-only grading (ELO/win-loss only)
- [ ] Pro/Elite pipeline paths stubbed (resolver returns correct tier; full Qwen + Elite worker implementation ships in P-07)
- [ ] iOS and Android builds pass store review checklists
- [ ] Secrets in environment variables — no hardcoded keys in any committed file
- [ ] Cloudflare R2 bucket policy: private (pre-signed URL only, no public list)
