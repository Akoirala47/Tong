# Tong Post-MVP Task Breakdown — Two-Developer Parallel Plan

> **Dev A:** Backend (FastAPI, DB migrations, Celery workers, AI/ML pipeline)
> **Dev B:** Mobile (React Native screens, components, client integrations)
>
> **Assumption:** All tasks in [mvp_tasks.md](./mvp_tasks.md) are complete and deployed.
> Foundation, auth, DB, Agora (voice only), tiered worker pipeline, R2, and push notifications are in place — not repeated here.
> Cost/tier rules: [tdd_spec_computeEconomics.md](./specs/tdd_spec_computeEconomics.md)
>
> **Gate** = Dev B waits for this Dev A task before integrating real data.

---

## P-01 — Automated Slang Content Engine

*Entirely backend. No mobile UI for this feature — it feeds P-03 (prompts) and P-02 (content).*

### Dev A
- [ ] **A-P01-01** — Add `pgvector` extension; migration: `raw_slang_candidates`, `slang_terms`, `crawler_run_logs`
- [ ] **A-P01-02** — Unit tests: Apify TikTok parser, X/Twitter parser, DeepSeek filter JSON parser, cosine similarity deduplication
- [ ] **A-P01-03** — Apify TikTok scraper integration: authenticate, search by language hashtag, extract transcripts → `raw_slang_candidates`
- [ ] **A-P01-04** — X/Twitter API v2 integration: search trending terms by locale → `raw_slang_candidates`
- [ ] **A-P01-05** — DeepSeek CEFR filter: batch-classify candidates → CEFR + formality + validity; write to `slang_terms`
- [ ] **A-P01-06** — Embedding pipeline: generate vectors for each validated term; upsert into `slang_terms.embedding`
- [ ] **A-P01-07** — Cosine similarity dedup: skip insert if similarity > 0.95 against existing terms
- [ ] **A-P01-08** — `GET /slang/terms`, `GET /slang/terms/similar` (vector search), `POST /slang/crawler/trigger` (admin), `GET /slang/crawler/logs`
- [ ] **A-P01-09** — Celery Beat schedule: daily crawl per active language
- [ ] **A-P01-10** — Integration tests: full pipeline inserts new terms, deduplicates, vector similarity search returns correct results

### Dev B
*(No tasks — this feature has no mobile surface. Dev B can use this sprint to pay down any mobile polish debt from MVP.)*

---

## P-02 — Procedural Solo Content Generation

### Dev A
- [ ] **A-P02-01** — Migration: `grammar_templates`, `vocabulary_nodes`, `generated_cards`
- [ ] **A-P02-02** — Author initial grammar templates: Spanish Bronze + Silver (≥ 20 per tier)
- [ ] **A-P02-03** — Migrate existing `exercise_cards` seed data into `vocabulary_nodes`
- [ ] **A-P02-04** — Unit tests: slot resolution, vocabulary sampling by type/tier, conjugation rules, fingerprint reproducibility, cache hit/miss
- [ ] **A-P02-05** — Slot resolution engine: query `vocabulary_nodes` by slot_type + tier_id, apply conjugation
- [ ] **A-P02-06** — Sentence assembly + generation fingerprint (hash of template_id + vocab_node_ids)
- [ ] **A-P02-07** — `GET /content/generate` — cache-first; on miss, generate + insert + dispatch audio Celery task
- [ ] **A-P02-08** — Celery task `synthesize_card_audio(card_id, sentence, language)`: Fish Audio S2 → R2 → update `audio_url`
- [ ] **A-P02-09** — `POST /content/templates`, `GET /content/templates` (admin)
- [ ] **A-P02-10** — Update lesson API to use `GET /content/generate` for tiers with templates; graceful fallback to static cards
- [ ] **A-P02-11** — Integration tests: correct tier content, cache hit on repeat, audio task fires and sets URL

> **🔒 Gate P-02:** Dev B updates lesson screen after A-P02-10 is deployed.

### Dev B
- [ ] **B-P02-01** — Update lesson card component: handle `audio_url = null` gracefully (text-only mode while audio synthesizes)
- [ ] **B-P02-02** — Add audio playback button to translate + fill-blank card types (plays `audio_url` when available)

---

## P-03 — Dynamic JIT Matchmaking Prompts

### Dev A
- [ ] **A-P03-01** — Migration: `user_vocabulary`, `match_prompts`, `user_seen_slang`
- [ ] **A-P03-02** — Backfill script: populate `user_vocabulary` from existing `user_card_responses` + `user_flashcard_queue`
- [ ] **A-P03-03** — Unit tests: vocabulary overlap intersection, confidence exclusion, slang injection selection, 30-day dedup, confidence arithmetic
- [ ] **A-P03-04** — `get_known_vocabulary(user_id, language)` — query `user_vocabulary` where confidence ≥ 0.3; Redis cache (5-min TTL)
- [ ] **A-P03-05** — Vocabulary overlap function: set intersection of two players' known words
- [ ] **A-P03-06** — Slang injection: query `slang_terms` for CEFR-appropriate terms not in `user_seen_slang` for either player
- [ ] **A-P03-07** — `POST /prompts/generate`: overlap + injection + DeepSeek call; write `match_prompts`; record `user_seen_slang`
- [ ] **A-P03-08** — Fallback: DeepSeek timeout (> 8s) → draw from static MVP prompt pool; log fallback
- [ ] **A-P03-09** — Wire JIT prompt into matchmaking Celery task: call `POST /prompts/generate` after pairing, before WebSocket push
- [ ] **A-P03-10** — Wire confidence updates into flashcard review (M-03) and post-match flagged words (M-08)
- [ ] **A-P03-11** — Integration tests: prompt generated on match, overlap correct, slang not repeated within 30 days, fallback on timeout

> **🔒 Gate P-03:** No new mobile screens needed — prompts appear automatically on the existing lobby screen (M-06 B-M06-04).

### Dev B
*(No new screens — lobby screen already renders `prompt_text` from the match object. Dev B uses this sprint for P-04 prep or polish.)*

---

## P-04 — Advanced Phoneme Analysis Pipeline

*Entirely backend. Mobile result screen gains one new section (pronunciation breakdown) after the gate.*

### Dev A
- [ ] **A-P04-01** — Migration: `native_phoneme_references`, `phoneme_analysis_results`
- [ ] **A-P04-02** — Populate `native_phoneme_references`: Spanish phoneme F1/F2 baselines from academic corpora
- [ ] **A-P04-03** — Install + pin: `transformers` (wav2vec2), `speechbrain`, `parselmouth` in `workers/requirements.txt`
- [ ] **A-P04-04** — Unit tests: wav2vec2 output parsing, GOP threshold (< 0.4 = mispronounced), formant deviation, pipeline skips formant if no flagged vowels
- [ ] **A-P04-05** — `align_phonemes(audio_path, transcript, language)` via wav2vec2 CTC forced alignment; preload model weights on worker startup
- [ ] **A-P04-06** — `score_pronunciation(phoneme_alignment, language)` via SpeechBrain GOP
- [ ] **A-P04-07** — `analyze_formants(audio_segment, flagged_vowels)` via parselmouth; compute deviation from `native_phoneme_references`
- [ ] **A-P04-08** — Stage 2.5 Celery task: run only when `pipeline_tier='elite_phoneme'`; write to `phoneme_analysis_results`
- [ ] **A-P04-09** — Extend DeepSeek prompt with phoneme data; pronunciation-specific coaching in feedback
- [ ] **A-P04-10** — Gate Stage 2.5 behind Pro + on-demand trigger (not every Pro job)
- [ ] **A-P04-11** — Update flashcard injection: also inject phoneme-flagged words (not just DeepSeek-flagged)
- [ ] **A-P04-12** — Integration tests: on-demand promotion, auto-flag trigger, free user blocked
- [ ] **A-P04-13** — `POST /matches/live/{id}/pronunciation-analysis` + async duel variant; enqueue `elite_phoneme` on `elite_gpu` queue (Elite users only)

> **🔒 Gate P-04:** Dev B adds pronunciation section to result screen after A-P04-09 + A-P04-12 deployed.

### Dev B
- [ ] **B-P04-01** — Update match result screen: add "Pronunciation" section (Pro badge + mispronounced phoneme list + coaching note)
- [ ] **B-P04-02** — "Pro only" paywall prompt on pronunciation section for free users
- [ ] **B-P04-03** — "Analyze pronunciation" CTA button (Elite) triggers on-demand `elite_phoneme` job; paywall prompt for Free/Plus/Pro

---

## P-05 — Squad Queues (Duo / Trio / Quad)

### Dev A
- [ ] **A-P05-01** — Migration: `parties`, `party_members`, `party_invites`, `squad_matches`
- [ ] **A-P05-02** — Unit tests: party MMR average, size limits, leader transfer on departure, invite expiry
- [ ] **A-P05-03** — Party CRUD: `POST /parties`, invite, respond, leave endpoints
- [ ] **A-P05-04** — Leader transfer: next member (by join time) becomes leader when leader leaves
- [ ] **A-P05-05** — `POST /parties/{id}/queue` — compute avg MMR, add to Redis `queue:es:duo` (or trio/quad) sorted set
- [ ] **A-P05-06** — Extend matchmaking Celery task: add squad queue scan; match two parties of same size within ±150 avg MMR
- [ ] **A-P05-07** — `squad_matches` creation: one Agora channel for all members; Agora tokens for each player
- [ ] **A-P05-08** — WebSocket push to all party members on match found
- [ ] **A-P05-09** — Post-match pipeline: each player gets individual processing job (separate audio tracks)
- [ ] **A-P05-10** — ELO: team-level win/loss; per-player delta calculated using team-average ELO vs opponent avg
- [ ] **A-P05-11** — Integration tests: duo party forms, queues, matches, all players receive individual results

> **🔒 Gate P-05:** Dev B builds party screens after A-P05-03 + A-P05-08 are deployed.

### Dev B
- [ ] **B-P05-01** — Party lobby screen: create party, invite friends by username, member list with MMR display, Ready to Queue button
- [ ] **B-P05-02** — Pending invite notification handler: accept/decline screen
- [ ] **B-P05-03** — Squad match screen: extended live battle UI showing all participants; 4-player layout
- [ ] **B-P05-04** — E2E test: duo party forms, queues, reaches live match screen

---

## P-06 — Dynamic Leaderboards

### Dev A
- [ ] **A-P06-01** — Migration: `weekly_leaderboard_snapshots`, `user_regions`, `user_friends`
- [ ] **A-P06-02** — Unit tests: Redis sorted set rank, weekly reset, friends board on-request computation
- [ ] **A-P06-03** — Wire ELO sorted set update into `update_elo` (M-07); wire XP sorted set update into XP award (M-09) — both in-transaction with DB
- [ ] **A-P06-04** — `GET /leaderboards/{language}/elo` — read Redis sorted set, paginated, with `my_rank` injected
- [ ] **A-P06-05** — `?scope=regional` — separate Redis sorted set per region via `user_regions`
- [ ] **A-P06-06** — `?scope=friends` — computed on-request from `user_friends` + `profiles.elo`
- [ ] **A-P06-07** — Weekly XP + all-time XP leaderboard endpoints; wire into gamification XP service
- [ ] **A-P06-08** — Celery Beat Monday reset: delete weekly XP sorted sets, snapshot top 100 to `weekly_leaderboard_snapshots`
- [ ] **A-P06-09** — `GET /leaderboards/{language}/me/rank` — all boards in one call
- [ ] **A-P06-10** — Integration tests: ELO board updates after match, reset runs and snapshots, friends board correct

> **🔒 Gate P-06:** Dev B builds leaderboard screens after A-P06-04 + A-P06-09 deployed.

### Dev B
- [ ] **B-P06-01** — Leaderboards screen: tabs for ELO / Weekly XP / All-Time XP; scope filter chips (Global / Regional / Friends)
- [ ] **B-P06-02** — Rank list row component: avatar, username, rank badge, score, position delta indicator
- [ ] **B-P06-03** — "My rank" sticky footer showing current user's position on the active board

---

## P-07 — Tong Subscription Tiers (Plus / Pro / Elite)

### Dev A
- [ ] **A-P07-01** — Migration: `subscriptions` (with `plan_tier` column), `subscription_events`
- [ ] **A-P07-02** — Confirm `queue_type` on `processing_jobs` exists from M-08 (no duplicate migration)
- [ ] **A-P07-03** — Set up Stripe account; configure three subscription products: **Plus $9.99** (`tong_plus_monthly_999`), **Pro $15.99** (`tong_pro_monthly_1599`), **Elite $19.99** (`tong_elite_monthly_1999`) + matching Apple/Google SKUs
- [ ] **A-P07-04** — Unit tests: `subscription_tier()` Redis cache hit/miss, plan tier checks (plus/pro/elite/free), cap enforcement per tier
- [ ] **A-P07-05** — `subscription_tier(user_id)` → `'free'|'plus'|'pro'|'elite'`; Redis cache (5-min TTL) backed by `subscriptions` table
- [ ] **A-P07-06** — `POST /webhooks/stripe` — validate signature; handle created/updated/deleted/upgraded; write `plan_tier`; invalidate Redis cache
- [ ] **A-P07-07** — `POST /webhooks/apple` — validate Apple server notification; map to create/renew/cancel; write `plan_tier`
- [ ] **A-P07-08** — `POST /webhooks/google` — validate Google RTDN; map to create/renew/cancel; write `plan_tier`
- [ ] **A-P07-09** — `POST /subscriptions/checkout`, `GET /subscriptions/me`, `POST /subscriptions/cancel`
- [ ] **A-P07-10** — Wire `subscription_tier()` into: async duel cap (M-05), tier resolver (M-08), phoneme on-demand gate (P-04)
- [ ] **A-P07-11** — Implement full/elite Celery worker paths (Qwen3-ASR-0.6B on `qwen` queue; whisper-large-v3-turbo on `elite_gpu` queue) — these were stubbed in MVP M-08
- [ ] **A-P07-12** — Integration tests: Stripe webhook creates correct plan_tier, cache invalidated, caps enforced per tier, full+elite pipelines actually run

> **🔒 Gate P-07:** Dev B integrates purchase flow after A-P07-06 + A-P07-09 deployed.

### Dev B
- [ ] **B-P07-01** — App store setup: three Apple IAP products + three Google Play Billing SKUs configured in respective consoles
- [ ] **B-P07-02** — Integrate RevenueCat SDK (handles Apple + Google purchase validation + cross-platform subscription state)
- [ ] **B-P07-03** — Paywall screen: four-column comparison (Free / Plus $9.99 / Pro $15.99 / Elite $19.99); highlight Pro as recommended
- [ ] **B-P07-04** — Trigger paywall: show on fourth async duel attempt (free), on ninth duel attempt (plus), on second-match result screen (free/plus cap), on Elite-only feature tap
- [ ] **B-P07-05** — Subscription management screen: current plan + tier badge, next billing date, Upgrade/Downgrade button, Cancel button

---

## P-08 — Linguistic Analytics Dashboard

*Entirely backend processing; Dev B builds the dashboard UI after the gate.*

### Dev A
- [ ] **A-P08-01** — Migration: `analytics_snapshots`
- [ ] **A-P08-02** — Unit tests: WPM aggregation, phoneme heatmap averaging, remedial track prompt builder, 403 for free users
- [ ] **A-P08-03** — Celery Beat Monday task: `generate_analytics_snapshots()` — aggregate past week's transcripts + phoneme results per user
- [ ] **A-P08-04** — `generate_remedial_track(user_id, language)` — 4 weeks of snapshots + phoneme history → DeepSeek → Redis cache (7-day TTL)
- [ ] **A-P08-05** — Analytics API endpoints: WPM trend, filler trend, phoneme heatmap, formant convergence, vocabulary growth, remedial track; all return 403 for free users
- [ ] **A-P08-06** — `POST /analytics/me/remedial/refresh` — invalidate cache, regenerate
- [ ] **A-P08-07** — Integration tests: Monday task creates snapshots, endpoints return correct time-series, 403 enforced

> **🔒 Gate P-08:** Dev B builds dashboard screens after A-P08-05 is deployed.

### Dev B
- [ ] **B-P08-01** — Analytics dashboard screen: tabbed (WPM / Phonemes / Formants / Vocabulary); "Pro only" gate with paywall prompt for free users
- [ ] **B-P08-02** — Phoneme heatmap component: grid of target language phonemes colored red → green by GOP score; tap phoneme → trend line
- [ ] **B-P08-03** — Reusable line chart component (WPM trend, formant deviation trend) using a lightweight chart library (e.g. `victory-native`)
- [ ] **B-P08-04** — Remedial track card: action items list, weak phoneme callouts, Refresh button

---

## P-09 — Priority Worker Queue

*Entirely backend infrastructure. No mobile UI.*

### Dev A
- [ ] **A-P09-01** — Confirm `queue_type` on `processing_jobs` exists from M-08
- [ ] **A-P09-02** — Unit tests: Pro user → priority queue, free user → standard queue, squad match with any Pro member → priority
- [ ] **A-P09-03** — Celery worker config: define two named queues (`standard`, `priority`) with separate concurrency pools
- [ ] **A-P09-04** — Railway deployment: add second worker service consuming only `priority` queue (always-on, min 2 replicas)
- [ ] **A-P09-05** — Update `dispatch_processing_job()`: call `subscription_tier()`, route to `standard`/`qwen`/`elite_gpu` queue, persist `queue_type` in DB
- [ ] **A-P09-06** — Update squad match dispatch: route to priority if any party member is Pro
- [ ] **A-P09-07** — `GET /admin/queue/stats` — Redis queue depths for both queues
- [ ] **A-P09-08** — SLA tracking: calculate `(completed_at - created_at)` per job; P50/P95 latency in admin stats
- [ ] **A-P09-09** — Integration test: under queue load, priority job completes before standard job

### Dev B
*(No tasks.)*

---

## P-10 — Audio CDN Caching System

*Entirely backend infrastructure with one mobile integration point.*

### Dev A
- [ ] **A-P10-01** — Migration: `audio_cache`, `tts_cost_log`
- [ ] **A-P10-02** — Configure Cloudflare Cache Rule on R2 path `tts-cache/*`: `Cache-Control: public, max-age=31536000, immutable`
- [ ] **A-P10-03** — Unit tests: cache key determinism (case-insensitive, stripped punctuation), cache hit returns existing URL without API call, hit_count increment
- [ ] **A-P10-04** — `get_or_synthesize_audio(language, word, voice_id)` — check `audio_cache`; on miss, call Fish Audio S2, upload to R2, insert cache row
- [ ] **A-P10-05** — `GET /tts/audio?language=es&word=hola` — public cache-first endpoint
- [ ] **A-P10-06** — `POST /admin/tts/cache/preload` — Celery task: iterate `vocabulary_nodes` for language/tier, call `get_or_synthesize_audio()` per word
- [ ] **A-P10-07** — Wire audio cache into: `flashcard_items.audio_url` (M-03) and `generated_cards.audio_url` (P-02) — both now call `get_or_synthesize_audio()` instead of Fish Audio directly
- [ ] **A-P10-08** — Run preload job for Spanish Bronze + Silver on production; log cost in `tts_cost_log`
- [ ] **A-P10-09** — Integration tests: first request synthesizes + caches; second returns cached URL; preload populates entire tier

> **🔒 Gate P-10:** Dev B switches audio source after A-P10-05 deployed.

### Dev B
- [ ] **B-P10-01** — Update flashcard audio playback: fetch URL from `GET /tts/audio` instead of stored `audio_url` field directly (enables cache URL resolution at request time)

---

---

## P-11 — In-App Advertising (Free Tier)

*Free users only. All paid tiers (Plus/Pro/Elite) are ad-free.*

### Dev A
- [ ] **A-P11-01** — Add `ad_impression_log` table: `user_id`, `ad_slot`, `shown_at`, `skipped_at`
- [ ] **A-P11-02** — Unit tests: impression counter, skip tracking, ensure paid users receive no ad signals
- [ ] **A-P11-03** — `GET /ads/next?slot=post_result|lesson_summary` — returns ad payload for free users; returns 204 for paid users
- [ ] **A-P11-04** — Wire lesson completion counter: every 2nd completed lesson for free users triggers `slot=lesson_summary` flag in lesson completion response
- [ ] **A-P11-05** — Integration tests: free user gets ad payload, paid user gets 204, impression logged correctly

> **🔒 Gate P-11:** Dev B integrates ad display after A-P11-03 deployed.

### Dev B
- [ ] **B-P11-01** — Integrate mobile ad SDK (e.g., Google AdMob); configure app IDs for iOS + Android
- [ ] **B-P11-02** — Post-result ad slot: show interstitial after match/duel result screen for free users; skippable after ~5s
- [ ] **B-P11-03** — Lesson summary ad slot: show banner/interstitial on every 2nd lesson summary screen for free users
- [ ] **B-P11-04** — Never show ads during: voice call, matchmaking queue, or any loading/processing state
- [ ] **B-P11-05** — "Remove ads" CTA on ad screens links to paywall (B-P07-03)

---

## Post-MVP Completion Checklist

- [ ] All P-01 through P-10 unit + integration tests green on CI
- [ ] JIT prompt generation validated end-to-end: matched pair receives personalized prompt with injected slang
- [ ] Phoneme on-demand analysis tested: Elite user taps CTA → `elite_phoneme` job → mispronounced phonemes in flashcard queue
- [ ] All three subscription tiers (Plus $9.99 / Pro $15.99 / Elite $19.99) tested on iOS (Apple IAP) and Android (Google Play)
- [ ] Qwen3-ASR-0.6B Pro pipeline validated end-to-end: Pro user match → Qwen queue → full grading (<30s)
- [ ] Whisper large-v3-turbo Elite pipeline validated end-to-end: Elite user match → elite_gpu queue → full grading (<30s)
- [ ] Priority queue validated under load: Pro user results < 30s, free user < 120s
- [ ] Audio CDN cache hit rate > 80% for Bronze + Silver vocabulary after preload
- [ ] Analytics Monday job runs clean; snapshots visible in dashboard
- [ ] Squad Duo match completed end-to-end with 4 simulated participants
