# TDD Spec: Compute Economics & Pipeline Tiering

> Canonical source of truth for cost-optimized infrastructure decisions.
> All pipeline, moderation, monetization, and worker specs must align with this document.
> See [narrative.md](../narrative.md) for North Star.

---

## 1. Overview

Tong's unit economics are dominated by **post-match GPU/CPU compute** (ASR + optional phoneme stack + DeepSeek), not live voice transport. The main cost driver is the ASR tier assigned to each job — Agora and DeepSeek are rounding errors by comparison (~$0.002–0.015/job for DeepSeek).

**Design principle:** Tier compute depth the same way we tier product features — free users get genuine daily coaching; paid users unlock unlimited depth and speed.

**Three infrastructure layers:**
- **Layer 1 — Live Voice:** Agora RTC (MVP) → self-hosted LiveKit (scale). Voice transport only. No cloud recording. No live STT.
- **Layer 2 — Post-Match Pipeline:** Client uploads audio → R2 → tiered ASR → toxicity scan → DeepSeek grading → ELO + flashcards + push notification.
- **Layer 3 — Monetization:** Free (ads + capped coaching), Plus/Pro/Elite (ad-free, deeper pipeline).

---

## 2. Pipeline Tiers

| Tier | ASR engine | DeepSeek prompt | Phoneme (P-04) | Typical cost/job |
|------|-----------|-----------------|----------------|------------------|
| `metadata_only` | None | None | No | ~$0.001 |
| `lite` | `whisper-small` (faster-whisper CPU, INT8) | Short JSON schema | No | ~$0.035 |
| `full` | `qwen3-asr-0.6b` (vLLM) + `qwen3-forcedaligner-0.6b` | Full grading prompt | No | ~$0.050–0.060 |
| `elite` | `whisper-large-v3-turbo` (faster-whisper GPU) | Full grading prompt | No | ~$0.080 |
| `elite_phoneme` | `whisper-large-v3-turbo` | Full + phoneme data | Yes (on-demand) | ~$0.11–0.20 |

### ASR engine guide

| Engine | Role |
|--------|------|
| `whisper-small` (CPU) | Cheapest path. Good enough for free daily lite + Plus capped jobs. |
| `qwen3-asr-0.6b` (vLLM) | Pro workhorse. Strong multilingual (52 langs). Apache 2.0. Needs vLLM, not faster-whisper. |
| `qwen3-forcedaligner-0.6b` | Second pass after Qwen ASR → word start/end times for WPM, fillers, flashcards. |
| `whisper-large-v3-turbo` | Elite "best accuracy" tier. One pass = transcript + timestamps. GPU required. |
| Phoneme stack (P-04) | wav2vec2 + SpeechBrain + parselmouth. Elite / on-demand only. |

### Tier assignment

```python
def resolve_pipeline_tier(user_id: str, source_type: str) -> str:
    """
    source_type: 'live_match' | 'async_duel'
    Returns: 'metadata_only' | 'lite' | 'full' | 'elite' | 'elite_phoneme'
    """
    sub = subscription_tier(user_id)  # 'free' | 'plus' | 'pro' | 'elite'

    if sub == "elite":
        return "elite"  # promoted to elite_phoneme on-demand (P-04)

    if sub == "pro":
        return "full"   # qwen3-asr-0.6b + forced aligner

    # plus and free: whisper-small lite path with caps
    if source_type == "async_duel":
        if sub == "free":
            return "metadata_only"
        return "lite"   # plus gets lite async

    if source_type == "live_match":
        if sub == "plus" and monthly_coaching_cap_reached(user_id):
            return "metadata_only"
        if sub == "free" and daily_lite_cap_reached(user_id):
            return "metadata_only"
        return "lite"

    return "metadata_only"
```

### Per-tier behavior

**`metadata_only`**
- Skip ASR and DeepSeek
- Compute winner/ELO from match metadata (duration, engagement signals, forfeit state)
- No transcript, WPM, feedback, or flashcard injection

**`lite` (Free daily + Plus capped)**
- faster-whisper + `whisper-small` CPU, VAD silence trim
- Short DeepSeek prompt: winner, scores, flagged words, 1–2 sentence feedback
- Flashcard injection for flagged words
- Post-match toxicity scan on transcript

**`full` (Pro default)**
- `qwen3-asr-0.6b` via vLLM for transcription
- `qwen3-forcedaligner-0.6b` second pass for word-level timestamps (WPM, filler words)
- Full DeepSeek grading prompt + rich coaching
- Flashcard injection; priority Qwen GPU queue (<30s)

**`elite` (Elite default)**
- `whisper-large-v3-turbo` via faster-whisper GPU — single pass: transcript + word-level timestamps
- Full DeepSeek grading prompt + richest coaching
- Flashcard injection; priority Elite GPU queue (<30s)

**`elite_phoneme` (Elite on-demand)**
- Same as `elite` + Stage 2.5 phoneme pipeline (P-04)
- Triggered when: user taps "Analyze pronunciation", DeepSeek flags pronunciation issues, or weekly analytics refresh

---

## 3. Worker Queue Routing

| Queue | Hardware | Job tiers | SLA target |
|-------|----------|-----------|------------|
| `standard` | CPU | `metadata_only`, `lite` (whisper-small) | < 120s |
| `qwen` | GPU + vLLM | `full` (Qwen3-ASR-0.6B + ForcedAligner) | < 30s |
| `elite_gpu` | GPU + faster-whisper | `elite`, `elite_phoneme` | < 30s |

```python
def dispatch_processing_job(user_id: str, source_type: str, source_id: str):
    tier = resolve_pipeline_tier(user_id, source_type)
    sub = subscription_tier(user_id)
    if sub == "elite":
        queue = "elite_gpu"
    elif sub == "pro":
        queue = "qwen"
    else:
        queue = "standard"
    process_match.apply_async(
        args=[source_id, source_type, tier],
        queue=queue,
    )
```

### Worker efficiency requirements
- **faster-whisper** with INT8 quantization on CPU for `lite`; GPU for `elite`
- **vLLM** serving for Qwen3-ASR-0.6B with continuous batching on `qwen` queue
- **VAD trim** silence before transcription (~20–40% audio reduction)
- Keep models warm on GPU workers to avoid cold-start latency

---

## 4. Live Voice (RTC) Phasing

| Phase | MAU band | Solution | Notes |
|-------|----------|----------|-------|
| MVP | 0 – ~50k | **Agora RTC** (voice transport only) | 10k free min/mo; no cloud recording, no RTT |
| Scale | ~50k+ | **Self-hosted LiveKit** | Migrate when Agora bill consistently > ~$300/mo |

Agora/LiveKit handles **Layer 1: live transport only**. Recording, grading, and moderation use R2 + worker pipeline.

---

## 5. Toxicity Moderation (cost-optimized)

**MVP:** Post-match transcript scan — no Agora Cloud Recording, no Agora RTT.

- Run keyword + detoxify classifier on ASR output (lite/full/elite tiers only)
- Create `moderation_events`; issue warnings/bans post-match
- Ban check at queue entry blocks repeat offenders

**Deferred to v2:** Mid-match auto-mute via live STT.

See [[tdd_spec_toxicityModeration.md]] for full spec.

---

## 6. Monetization

Four subscription tiers. Ads shown to free users only — never during voice calls or matchmaking queue.

| | Free | Plus $9.99 | Pro $15.99 | Elite $19.99 |
|---|------|-----------|-----------|------------|
| **Net after ~15% store fee** | $0 | ~$8.49 | ~$13.59 | ~$16.99 |
| **Ads** | Yes (post-result + every 2 lessons) | No | No | No |
| **Flashcard audio** | Text only | Yes | Yes | Yes |
| **Async duels (active)** | 3 max | 8 max | Unlimited | Unlimited |
| **Async grading** | Metadata only | Lite (whisper-small) | Full (Qwen) | Full (Whisper Elite) |
| **Live coaching** | 1 lite/day; rest metadata | ~15 full/mo cap, then metadata | Unlimited full | Unlimited Elite |
| **ASR engine** | whisper-small CPU | whisper-small CPU | Qwen3-ASR-0.6B + ForcedAligner | Whisper large-v3-turbo |
| **DeepSeek** | Short prompt | Short prompt | Full grading | Full + richest coaching |
| **Worker queue** | Standard CPU (<120s) | Standard CPU (<120s) | Priority Qwen GPU (<30s) | Priority Elite GPU (<30s) |
| **Phoneme analysis** | None | None | Flagged + 5 manual/mo | Unlimited on-demand |
| **Analytics dashboard** | None | Basic stats | WPM trends | Full dashboard |

**Never paywall:** Solo Grind lessons, Boss Battles, ranked queue entry, unlimited live matches (only coaching depth varies).

**Default upgrade hero:** Pro at $15.99 (unlimited Qwen coaching).

### Ad placement (Free only — P-11)
- **Ad A:** Post-result screen after every completed live match or async duel
- **Ad B:** Every 2 Solo Grind lessons completed (lesson summary screen)
- Skippable after ~5s; never interrupt live voice calls

---

## 7. Cost Targets & Break-Even (reference)

### Cost per job

| Job type | ASR | + DeepSeek | + phoneme | Total |
|----------|-----|-----------|-----------|-------|
| Metadata only | — | — | — | ~$0.001 |
| Lite (Free/Plus) | whisper-small | short | — | ~$0.035 |
| Pro full | Qwen3-ASR + Aligner | full | — | ~$0.050–0.060 |
| Elite full | Whisper turbo | full | — | ~$0.080 |
| Elite + phoneme | Whisper turbo | full | yes | ~$0.11–0.20 |

### Break-even paid conversion (@ 100k MAU)

| Paid conversion | Infra margin |
|----------------|--------------|
| 5% | ~35–45% |
| 8% | ~70–75% |
| 10% | ~78–82% |

Break-even: ~2.5–3% paid conversion. Pro uses the cheaper Qwen path ($0.055) vs Elite Whisper turbo ($0.08), so heavy Pro adoption is more margin-friendly than a single Whisper-only tier.

*Excludes salaries, marketing, support.*

---

## 8. Environment & Config Keys

```
# Lite path (Free + Plus)
WHISPER_MODEL_LITE=whisper-small
FASTER_WHISPER_COMPUTE_TYPE=int8

# Pro path (Qwen)
QWEN_ASR_MODEL=qwen3-asr-0.6b
QWEN_ALIGNER_MODEL=qwen3-forcedaligner-0.6b
QWEN_VLLM_BASE_URL=http://qwen-worker:8000

# Elite path
WHISPER_MODEL_ELITE=whisper-large-v3-turbo

# Celery queues
CELERY_QUEUE_STANDARD=standard
CELERY_QUEUE_QWEN=qwen
CELERY_QUEUE_ELITE=elite_gpu

# Subscription pricing (informational — actual prices set in app-store consoles)
PLUS_MONTHLY_PRICE_USD=9.99
PRO_MONTHLY_PRICE_USD=15.99
ELITE_MONTHLY_PRICE_USD=19.99
```

---

## 9. Bidirectional Links

- [features.md](../features.md)
- Related specs: [[tdd_spec_postMatchPipeline.md]] (implementation), [[tdd_spec_toxicityModeration.md]] (post-match scan), [[tdd_spec_tongPro.md]] (pricing/tiers), [[tdd_spec_priorityQueue.md]] (queue routing), [[tdd_spec_phonemeAnalysis.md]] (on-demand Stage 2.5), [[tdd_spec_liveRankedBattles.md]] (RTC), [[tech_stack.md]](../tech_stack.md)
