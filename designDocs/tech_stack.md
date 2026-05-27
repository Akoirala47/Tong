# Tong: Tech Stack

> Phase 2 output. Adopted = explicitly named in idea.md. Proposed = inferred from project type and constraints.

---

## Adopted (Explicitly Specified in idea.md)

| Layer | Technology | Role |
|-------|-----------|------|
| ASR | `whisper-large-v3-turbo` | Transcription + word-level timestamp extraction in post-match worker |
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

### Real-Time Voice Infrastructure: Agora.io RTC SDK

**Justification:** Live ranked battles require sub-300ms latency voice calls with global routing, NAT traversal, and connection resilience — all of which raw WebRTC requires significant infrastructure to achieve. Agora's managed global edge network (SD-RTN) handles this. Toxicity moderation can tap Agora's server-side audio stream hooks. `react-native-agora` is the mobile SDK; Agora's server-side API manages channel tokens (preventing unauthorized match joining). Alternative considered: Livekit (open-source, self-hosted) — viable but requires more DevOps at MVP.

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
Workers:        Celery (Python) — Whisper, wav2vec2, SpeechBrain, parselmouth, DeepSeek
Live Voice:     Agora.io RTC SDK (react-native-agora + Agora server API)
TTS:            Fish Audio S2
LLM:            DeepSeek-V4-Flash
Storage:        Cloudflare R2
CDN:            Cloudflare
Containers:     Docker
Deploy (MVP):   Railway
Deploy (Scale): AWS ECS Fargate + ALB
```
