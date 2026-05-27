# Tong: Features Index

> This document is the canonical feature registry. Every feature links to its TDD/Spec file.
> Categories: **MVP** (essential for first functional release) | **Post-MVP** (future enhancements).
> Infrastructure & cost tiering: [tdd_spec_computeEconomics.md](./specs/tdd_spec_computeEconomics.md)
> See [narrative.md](./narrative.md) for the project North Star.

---

## MVP Features

These features constitute the minimum playable, releasable version of Tong. A user must be able to: create an account, grind solo lessons, fight an async duel, and queue into a live ranked match — with basic post-match feedback and an ELO update.

| # | Feature | Description | Spec File |
|---|---------|-------------|-----------|
| M-01 | User Authentication & Profile | Account creation, login, JWT sessions, OAuth (Google/Apple), and the public profile page with rank display | [tdd_spec_userAuth.md](./specs/tdd_spec_userAuth.md) |
| M-02 | Solo Grind — Micro-Lessons | Bite-sized interactive drills covering vocabulary, grammar, and sentence structures scoped to the player's current ELO bracket | [tdd_spec_microLessons.md](./specs/tdd_spec_microLessons.md) |
| M-03 | Solo Grind — Intelligent Flashcards | Error-driven spaced-repetition flashcard system; ingests weak words from lessons and PvP matches; rapid swipe interface | [tdd_spec_intelligentFlashcards.md](./specs/tdd_spec_intelligentFlashcards.md) |
| M-04 | Solo Grind — Boss Battles | Timed rank-up assessments gating progression to the next solo tier; requires genuine mastery to pass | [tdd_spec_bossBattles.md](./specs/tdd_spec_bossBattles.md) |
| M-05 | Async Audio Duels | Turn-based voice messaging battles with a 12-hour response window; contributes micro-ELO on win | [tdd_spec_asyncAudioDuels.md](./specs/tdd_spec_asyncAudioDuels.md) |
| M-06 | Live Ranked Voice Battles (Solo Queue) | Real-time 1v1 voice-call battle with skill-based matchmaking; prompted conversational face-off; ELO update on conclusion | [tdd_spec_liveRankedBattles.md](./specs/tdd_spec_liveRankedBattles.md) |
| M-07 | ELO & Matchmaking System | Hidden MMR + visible rank tier; queue management; opponent pairing algorithm | [tdd_spec_eloMatchmaking.md](./specs/tdd_spec_eloMatchmaking.md) |
| M-08 | Post-Match Processing Pipeline (Core) | Tiered async pipeline: metadata-only / lite (free daily) / full (Pro) → faster-whisper + DeepSeek → ELO + feedback; see [tdd_spec_computeEconomics.md](./specs/tdd_spec_computeEconomics.md) | [tdd_spec_postMatchPipeline.md](./specs/tdd_spec_postMatchPipeline.md) |
| M-09 | Gamification & Progression (Core) | XP for all activity types, daily login streaks, rank badges on profile, streak shields | [tdd_spec_gamification.md](./specs/tdd_spec_gamification.md) |
| M-10 | Toxicity Moderation | Post-match transcript scan for slurs/harassment; warnings + bans at queue entry (no Agora RTT) | [tdd_spec_toxicityModeration.md](./specs/tdd_spec_toxicityModeration.md) |

---

## Post-MVP Features

These features extend, enrich, and monetize the MVP foundation. They assume all M-01 through M-10 tasks are complete and deployed.

| # | Feature | Description | Spec File |
|---|---------|-------------|-----------|
| P-01 | Automated Slang Content Engine | Daily web-crawler monitors TikTok/X for regional slang; LLM filters for CEFR level; stores in vector DB | [tdd_spec_slangCrawler.md](./specs/tdd_spec_slangCrawler.md) |
| P-02 | Procedural Solo Content Generation | Rule dependency graph + Fish Audio S2 TTS generates unique flashcard sentences and audio on demand; replaces static deck | [tdd_spec_proceduralContentGen.md](./specs/tdd_spec_proceduralContentGen.md) |
| P-03 | Dynamic JIT Matchmaking Prompts | DeepSeek generates custom prompts per match from players' shared vocabulary overlap + one injected slang term | [tdd_spec_dynamicPrompts.md](./specs/tdd_spec_dynamicPrompts.md) |
| P-04 | Advanced Phoneme Analysis Pipeline | wav2vec2 phoneme alignment → SpeechBrain GOP pronunciation scoring → parselmouth F1/F2 formant analysis on flagged vowels | [tdd_spec_phonemeAnalysis.md](./specs/tdd_spec_phonemeAnalysis.md) |
| P-05 | Squad Queues (Duo / Trio / Quad) | Party matchmaking for 2v2, 3v3, 4v4 multi-player conversational skirmishes | [tdd_spec_squadQueues.md](./specs/tdd_spec_squadQueues.md) |
| P-06 | Dynamic Leaderboards | Weekly and all-time boards segmented by Solo XP and Ranked ELO; global, regional, and friends filters | [tdd_spec_leaderboards.md](./specs/tdd_spec_leaderboards.md) |
| P-07 | Tong Subscription Tiers | Three paid tiers — Plus ($9.99), Pro ($15.99), Elite ($19.99) — gating ASR depth, async duel caps, phoneme analysis, and analytics; free tier caps enforced server-side | [tdd_spec_tongPro.md](./specs/tdd_spec_tongPro.md) |
| P-11 | In-App Advertising | Ad-supported free tier: post-result ads after every match/duel + every 2 Solo Grind lessons; all paid tiers are ad-free | [tdd_spec_tongPro.md](./specs/tdd_spec_tongPro.md) |
| P-08 | Linguistic Analytics Dashboard | Long-term trend charts for WPM, F1/F2 formant accuracy, phoneme heatmaps, custom LLM remedial tracks (Pro only) | [tdd_spec_linguisticAnalytics.md](./specs/tdd_spec_linguisticAnalytics.md) |
| P-09 | Priority Worker Queue | Dedicated high-throughput processing lanes for Pro users; SLA-backed turnaround time | [tdd_spec_priorityQueue.md](./specs/tdd_spec_priorityQueue.md) |
| P-10 | Audio CDN Caching System | Globally cache Fish Audio S2 synthesized audio at CDN/edge so common terms incur synthesis cost only once | [tdd_spec_audioCDN.md](./specs/tdd_spec_audioCDN.md) |

---

## Infrastructure Reference

| Doc | Purpose |
|-----|---------|
| [tdd_spec_computeEconomics.md](./specs/tdd_spec_computeEconomics.md) | Pipeline tiers (metadata_only/lite/full/elite), ASR engines (whisper-small/Qwen3/whisper-turbo), 3 worker pools, subscription pricing, break-even assumptions |
