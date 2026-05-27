# Tong: Product & Technical Architecture Document

## The Narrative: What is Tong?

Tong is the world's first competitive language-learning ecosystem, combining a rigorous solo-study "grind" with a high-stakes, ELO-based multiplayer arena.

Learning a language requires two things: building the knowledge, and actually using it under pressure. Tong delivers both. Players spend time in the **Solo Path (PvE)** grinding through bite-sized lessons and Boss Battles to build their vocabulary. Throughout the day, they can keep their minds sharp with **Async Audio Duels**, which serve as daily chess puzzles, offering turn-based, low-pressure vocal matches. Then, when they are ready to sweat, they take those skills into the **Ranked Arena (Live PvP)**, queueing up for live, prompted voice battles against players of the exact same skill level.

By blending the deep, structured progression of a traditional learning app with the asynchronous strategy of chess puzzles and the adrenaline-pumping matchmaking of competitive games like *Valorant* or *League of Legends*, Tong forces players to think and speak on their feet, transforming language learning into a thrilling, habit-forming esport.

---

## Core Product Features

### 1. The Solo Grind (The PvE Path)

Before jumping into the multiplayer arena, players must build their underlying stats. This is a highly structured solo-learning journey where players grind through official language proficiency levels.

* **Micro-lessons (The Grind):** Bite-sized, interactive drills focusing on the exact vocabulary, grammar, and sentence structures required to survive the player's current ELO bracket.
* **Intelligent Flashcards (Weakness Drills):** A smart, error-driven review system. The app tracks exactly which words a player stumbles on across both solo lessons and live multiplayer matches, automatically resurfacing them for drilling via a rapid swipe interface.
* **Boss Battles (Rank-Up Assessments):** To progress to the next major difficulty tier in the solo path, players must defeat a "Boss Battle." These are challenging, strictly timed solo tests that assess cumulative knowledge. Passing requires genuine mastery of the tier's material.

### 2. Async Audio Duels (The "Chess Puzzles")

For players who want multiplayer interaction without committing to a live, real-time match. These function like daily chess puzzles or correspondence chess.

* **Turn-Based Voice Messaging:** Players are matched up and given a conversational prompt. Each player records a short voice note (their "move") and sends it asynchronously.
* **Play at Your Own Pace:** Players have a generous window to respond (e.g., 12 hours), making it easy to take turns during daily downtime.
* **Micro-ELO Gains:** Winning async puzzles contributes fractionally to the player's overall matchmaking rank, offering a low-pressure path to climb the ladder.

### 3. Live Ranked Voice-Call Battles (The PvP Arena)

The main event. Fluency tested under true, real-time competitive pressure.

* **Prompted Audio Face-Offs:** Players load into a live voice-call battle. The system serves a conversational prompt or roleplay scenario, and players must immediately respond and interact out loud in the target language.
* **Skill-Based Matchmaking (ELO):** Every player has a hidden Matchmaking Rating (MMR) and a visible Rank. The system matches opponents of equivalent skill levels to ensure fair, competitive matches.
* **Squad Queues (Solo, Duo, Trio, Quad):** Supports individual queues or party matches where friends form teams to tackle multi-player conversational challenges and language skirmishes.

### 4. Asynchronous Post-Match Referee & VOD Review

Tong acts as a 24/7 coach and analyst. To guarantee zero network or processing latency during live competitive matches, all intensive linguistic grading is handled asynchronously after the match concludes.

* **Post-Match Breakdown (VOD Review):** Once a match or async puzzle ends, local audio recordings are compressed and processed by backend worker nodes. Players receive a granular breakdown calculating words-per-minute (WPM), pinpointing explicit pronunciation inaccuracies, mapping filler words (*um*, *uh*), and offering structural syntax corrections.
* **Asynchronous Match Grading:** The AI referee evaluates the complete match transcript post-game, scoring prompt adherence, conversational logic, and vocabulary complexity to determine the match outcome and calculate final ELO adjustments.
* **Targeted Weakness Ingestion:** Any specific word, phrase, or slang term a player mispronounces or misuses during a PvP match is automatically flagged by the post-match referee and injected directly into their *Solo Grind Intelligent Flashcards*.

### 5. Gamification & Progression

Esports-style progression hooks designed to sustain player engagement on the solo path and the competitive ladder.

* **Rank Borders & Badges:** User profiles display current ELO rank badges, unlocking progress rings and dynamic profile banners as players level up.
* **Dynamic Leaderboards:** Weekly and all-time leaderboards comparing Solo-path Experience Points (XP) or Ranked ELO against friends, regional groups, or the global community.
* **Daily Streaks & XP:** Account XP awarded for matches played, solved async puzzles, completed training drills, and maintaining consecutive daily logins.

---

## Backend Engine & Data Pipelines

### 6. The Automated Content Engine

To support an evolving competitive meta without manual content curation bottlenecking scaling.

* **The Slang Web-Crawler:** Automated daily scrapers monitor regional social media platforms (e.g., TikTok transcript extraction, X) to extract emerging conversational shortcuts, idioms, and contemporary slang. A filtering LLM assesses this data for CEFR difficulty and formality, storing validated terms in a vector database to keep prompts completely current.
* **Procedural Solo Grind Gen:** The PvE path runs on a localized language rule dependency graph. The backend procedurally generates distinct flashcard sentences combining structural and vocabulary nodes. It passes these to **Fish Audio S2** to generate high-quality, native-sounding speech audio on demand.

### 7. Dynamic Matchmaking Prompts

Scenarios in both Async Duels and Live PvP are generated Just-In-Time (JIT) via an LLM.

* **State Intersection:** The matchmaking system cross-references the backend profiles of matched players to calculate their exact vocabulary overlap.
* **JIT Generation:** **DeepSeek-V4-Flash** instantly generates a custom conversational prompt built from that shared vocabulary state, intentionally injecting one or two fresh slang terms pulled directly from the Web-Crawler database to challenge the players.

### 8. Trust, Safety, and Processing Architecture

* **Toxicity Moderation:** Post-match transcript scanning (keyword filter + ML classifier) on Whisper output — no live STT infrastructure required at MVP. Warnings and bans enforced at queue entry; mid-match auto-mute deferred to v2.
* **The Post-Match Worker Pipeline (tiered):**
1. **Storage:** When a match concludes, client applications upload recorded audio to **Cloudflare R2**.
2. **Queueing:** Upload triggers a tiered Celery job (`metadata_only`, `lite`, `full`, `elite`, or `elite_phoneme`) based on user subscription and daily caps.
3. **Python Worker Stack:**
   * **Free — lite (1/day):** `whisper-small` via faster-whisper CPU → short DeepSeek grading → ELO + brief feedback + flashcard injection.
   * **Free — metadata-only:** Same-day extra live matches and all free async duels → ELO/win-loss only, no transcription.
   * **Plus ($9.99/mo):** Ad-free; capped coaching (~15/mo); lite async grading; still whisper-small path.
   * **Pro ($15.99/mo):** `qwen3-asr-0.6b` via vLLM + ForcedAligner → unlimited full DeepSeek grading; priority Qwen GPU queue (<30s).
   * **Elite ($19.99/mo):** `whisper-large-v3-turbo` → unlimited Elite grading; priority GPU queue; unlimited on-demand phoneme analysis.





---

## Monetization Strategy & System Economics

### 9. Subscription Tiers vs. Free Tier

Operational costs scale linearly with user speech volume. The feature tiers are architected to insulate profit margins from heavy computational compute requirements.

**Free Tier Constraints:**
* **Ads:** Post-result interstitial after every match/duel + every 2 Solo Grind lessons.
* **Async Duels:** Capped at 3 active duels; grading is **metadata-only** (ELO/win-loss, no ASR/feedback).
* **VOD Review:** Only the **first live match of the day** triggers a **lite** pipeline (`whisper-small` + brief DeepSeek feedback). Subsequent same-day matches receive ELO-only metadata results.
* **Cached Solo Assets:** Unlimited text flashcards. Audio generated via *Fish Audio S2* is globally cached at the CDN or edge storage level so common terms only incur a synthesis charge once.

**Plus ($9.99/mo):** Ad-free; 8 active async duels; ~15 coaching jobs/month cap (still whisper-small path).

**Pro ($15.99/mo):** Unlimited `qwen3-asr-0.6b` full pipeline on every match and duel; priority Qwen GPU queue (<30s SLA); phoneme on flagged words (5 manual/mo).

**Elite ($19.99/mo):** Unlimited `whisper-large-v3-turbo` pipeline; priority Elite GPU queue (<30s SLA); unlimited on-demand phoneme analysis; full linguistic analytics dashboard.