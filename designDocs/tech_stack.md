# Tong: Tech Stack

> Phase 2 output. Adopted = explicitly named in idea.md. Proposed = inferred from project type and constraints.

---

## Adopted (Explicitly Specified in idea.md)

| Layer | Technology | Role |
|-------|-----------|------|
| ASR — lite | `whisper-small` | Free + Plus daily coaching via **faster-whisper** CPU (INT8). Cheapest path. |
| ASR — Pro | `qwen3-asr-0.6b` + `qwen3-forcedaligner-0.6b` | Pro tier transcription via **vLLM** (not faster-whisper). ForcedAligner provides word-level timestamps for WPM + fillers. Apache 2.0. |
| ASR — Elite | `whisper-large-v3-turbo` | Elite tier via **faster-whisper GPU**. Single-pass transcript + timestamps. Highest accuracy. |
| Phoneme Alignment | `wav2vec2` | Maps spoken phonemes to word-level timestamps |
| Pronunciation Scoring | `SpeechBrain GOP` | Goodness-of-Pronunciation scoring against cached native phoneme references |
| Formant Analysis | `parselmouth` | F1/F2 vowel formant extraction for accent deviation analysis |
| TTS | Fish Audio S2 | Native-quality speech synthesis for solo content audio |
| LLM | DeepSeek-V4-Flash | JIT prompt generation, match grading, natural language feedback, slang CEFR filtering |
| Blob Storage | Cloudflare R2 | Primary audio file storage (post-match uploads, cached TTS audio) |
| Worker Runtime | Python | All post-match processing nodes run Python |

---

## Proposed (Unspecified — Justified Below)

### Mobile Frontend: React Native (TypeScript)

**Justification:** Cross-platform iOS/Android from a single codebase. The `react-native-agora` SDK provides first-class Agora RTC integration. `expo-av` handles local audio recording (async duel capture). Strong TypeScript ecosystem aligns with the type-safety needed for complex game-state management. Alternatives considered: Flutter (excellent, but Dart; smaller ecosystem for audio/RTC bindings), native Swift/Kotlin (best performance, unacceptable dev velocity cost for MVP).

### Backend API: FastAPI (Python)

**Justification:** Python is already the worker-stack language. A unified language reduces context-switching and enables shared utility libraries (e.g., shared Pydantic models between API and workers). FastAPI is async-native via `asyncio`, with automatic OpenAPI docs. Celery integrates natively with FastAPI for job dispatch. Alternative considered: Node.js/Express (good WebSocket support, but introduces a second language).

### Primary Database: PostgreSQL

**Justification:** Relational model fits ELO records, match history, user profiles, and lesson progress perfectly. Auditable, ACID-compliant. `pgvector` extension handles vector similarity search for vocabulary overlap calculation (Post-MVP), eliminating a separate vector DB service at MVP scale.

### Cache / Session / Queue Broker: Redis

**Justification:** Multi-role: (1) Celery broker for the async worker queue, (2) session cache for JWT refresh tokens, (3) real-time matchmaking state (queue pool, active match registry), (4) leaderboard sorted sets. Single Redis instance covers all four at MVP scale.

### Async Job Queue: Celery + Redis

**Justification:** Native Python, mature, integrates directly with FastAPI. Supports priority queues (required for Tong Pro's priority worker lane in Post-MVP). Tasks: post-match audio processing, slang crawler jobs, TTS synthesis jobs. AWS SQS is a viable production alternative but adds operational overhead at MVP.

### Real-Time Voice Infrastructure: Agora.io RTC SDK (MVP) → LiveKit self-host (scale)

**Justification:** Live ranked battles require sub-300ms latency voice calls with global routing, NAT traversal, and connection resilience. Agora's managed SD-RTN handles this at MVP with 10k free minutes/mo. `react-native-agora` is the mobile SDK; server-side tokens prevent unauthorized channel join.

**Recording:** All live match audio is captured server-side via **Agora Individual Cloud Recording** (REST API) — no client upload. The match audio is already flowing through Agora's network; recording it server-side eliminates the reliability risk of mobile file uploads over 4G/3G. Recording is only triggered for non-`metadata_only` matches. Audio lands directly in Cloudflare R2 via Agora webhook; Celery pipeline is dispatched on receipt. No Agora RTT (moderation runs post-match on the transcript).

**Scale path (~50k MAU):** Migrate to **self-hosted LiveKit** when Agora bill consistently exceeds ~$300/mo. LiveKit uses the [Egress API](https://docs.livekit.io/egress/overview/) (`TrackEgress`) for per-player recording to R2 — same webhook pattern as Agora, zero client changes required on migration. See [[specs/tdd_spec_computeEconomics.md]].

### Worker Pipeline Tiering

**Justification:** Compute dominates unit economics. Pipeline tiers (`metadata_only`, `lite`, `full`, `elite`, `elite_phoneme`) map to ASR engine, DeepSeek prompt depth, and optional phoneme stack. Three Celery queues: `standard` (CPU — Free/Plus), `qwen` (GPU/vLLM — Pro), `elite_gpu` (GPU/faster-whisper — Elite). Free: 1 lite/day + metadata-only async. Plus $9.99: ad-free, capped lite coaching. Pro $15.99: unlimited Qwen full pipeline, priority queue. Elite $19.99: Whisper turbo + phoneme, priority queue. Canonical rules: [[specs/tdd_spec_computeEconomics.md]].

### Authentication: Supabase Auth

**Justification:** Provides JWT-based auth, OAuth (Google, Apple Sign-In — mandatory for App Store), and row-level security policies on PostgreSQL. Supabase Auth can be used standalone (API layer still FastAPI). Eliminates hand-rolling auth at MVP.

### CDN: Cloudflare

**Justification:** Cloudflare R2 is already the blob storage layer. Cloudflare's CDN sits in front of it natively at zero egress cost (R2 egress is free to Cloudflare network). Audio assets (cached TTS files) are served from 300+ PoPs globally.

### Containerization & Deployment: Docker + Railway (MVP) → AWS ECS Fargate (Scale)

**Justification:** Docker for consistent environments. Railway for rapid MVP deployment (managed Postgres, Redis, and service deploys from Dockerfile with minimal config). Migration path to AWS ECS Fargate when worker auto-scaling and VPC isolation become necessary.

---

## Full Stack Summary

```
Mobile:         React Native (TypeScript) + Expo
API:            FastAPI (Python) + Uvicorn
Auth:           Supabase Auth (JWT + OAuth)
Database:       PostgreSQL (+ pgvector extension)
Cache/Queue:    Redis (Celery broker + session + matchmaking state)
Workers:        Celery (Python) — faster-whisper (lite+elite), vLLM/Qwen3-ASR (pro), wav2vec2, SpeechBrain, parselmouth, DeepSeek
                standard queue (CPU/lite) | qwen queue (GPU/pro) | elite_gpu queue (GPU/elite)
Live Voice:     Agora.io RTC SDK + Individual Cloud Recording (MVP) → LiveKit + Egress API (scale)
Monetization:   Plus $9.99 / Pro $15.99 / Elite $19.99 — see tdd_spec_computeEconomics.md
TTS:            Fish Audio S2
LLM:            DeepSeek-V4-Flash
Storage:        Cloudflare R2
CDN:            Cloudflare
Containers:     Docker
Deploy (MVP):   Railway
Deploy (Scale): AWS ECS Fargate + ALB
```
