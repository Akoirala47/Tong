# TDD Spec: Audio CDN Caching System (P-10)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
Fish Audio S2-synthesized audio for common vocabulary words is cached globally at the Cloudflare CDN layer so any given word is synthesized only once across the entire player base. Subsequent requests for the same word in the same language serve from CDN edge with zero compute cost. This is the primary mechanism for making the free tier economically viable at scale.

### Cache Key Design

```
Audio cache key: tts:{language}:{voice_id}:{word_hash}

Examples:
  tts:es:es-female-native-01:abc123def456
  tts:ja:ja-male-native-01:789xyz012abc
```

Where `word_hash = SHA256(normalized_text)[:16]` — normalized = lowercase, stripped punctuation.

### Cache Architecture

```
[Request for word audio]
      │
      ▼
[Check audio_cache table for (language, word)]
      │
      ├─ HIT: return cached Cloudflare R2 URL
      │        → Cloudflare serves from nearest PoP
      │
      └─ MISS:
              POST to Fish Audio S2 API
              Upload audio bytes to R2:
                path: tts-cache/{language}/{word_hash}.ogg
              Insert into audio_cache table
              Return new URL
```

Cloudflare R2 path `tts-cache/` is configured with a Cloudflare Cache Rule:
- `Cache Control: public, max-age=31536000, immutable` (1 year; audio for a given word does not change)
- Served via Cloudflare's global CDN automatically

### Data Models

```sql
-- audio_cache
CREATE TABLE audio_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    word            TEXT NOT NULL,
    voice_id        TEXT NOT NULL,
    audio_url       TEXT NOT NULL,       -- Cloudflare R2 public URL
    file_size_bytes INTEGER,
    synthesis_cost_usd NUMERIC(10,6),    -- for cost tracking
    hit_count       INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(language, word, voice_id)
);

-- tts_cost_log (financial audit)
CREATE TABLE tts_cost_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_cache_id  UUID REFERENCES audio_cache(id),
    cost_usd        NUMERIC(10,6) NOT NULL,
    triggered_by    TEXT NOT NULL,       -- 'lesson_gen' | 'flashcard' | 'manual'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tts/audio` | Bearer | Get audio URL for a word (cache-first) |
| GET | `/admin/tts/cache/stats` | Admin | Cache hit rate, total words cached, cost savings |
| POST | `/admin/tts/cache/preload` | Admin | Pre-warm cache for a tier's full vocabulary |

### Pre-Warming Strategy
On initial deployment (or when a new language is added), an admin triggers a preload job:
1. Query all `vocabulary_nodes` for the language at Bronze and Silver tier
2. For each word not in `audio_cache`, call Fish Audio S2 and cache the result
3. Report total synthesis cost incurred

This front-loads the compute cost before any player encounters a cache miss.

### Cost Model Example
- Fish Audio S2: ~$0.015 per 1,000 characters
- Average word: ~6 characters → ~$0.00009 per word
- Bronze Spanish tier: ~500 words → ~$0.045 one-time cost
- After caching: 10,000 players listen for free

---

## 2. TDD Requirements

### Unit Tests

```python
# test_audio_cdn_unit.py
def test_cache_key_is_deterministic_for_same_word():
def test_cache_key_is_case_insensitive():
def test_cache_key_strips_punctuation():
def test_cache_hit_returns_existing_url_without_api_call():
def test_cache_miss_calls_fish_audio_api():
def test_cache_miss_uploads_to_r2():
def test_cache_miss_inserts_into_audio_cache_table():
def test_hit_count_incremented_on_cache_hit():
def test_cost_log_written_on_synthesis():
def test_preload_job_skips_already_cached_words():
```

### Integration Tests

```python
# test_audio_cdn_integration.py
def test_first_request_for_word_triggers_synthesis():
def test_second_request_for_same_word_returns_cached_url():
def test_audio_url_is_publicly_accessible():
def test_admin_preload_caches_all_tier_vocabulary():
def test_cache_stats_endpoint_returns_hit_rate():
def test_cost_log_records_synthesis_costs():
def test_different_languages_have_separate_cache_entries():
def test_different_voices_have_separate_cache_entries():
```

### E2E Tests

```
Scenario: Common flashcard word served from CDN
  Given the word "hola" has been synthesized and cached for Spanish
  When 1,000 users open a flashcard containing "hola"
  Then all 1,000 users receive audio from Cloudflare CDN edge
  And Fish Audio S2 is called exactly 0 additional times
  And the cache hit_count for "hola" is 1,000

Scenario: New language onboarded with pre-warm
  Given a new Japanese Bronze tier is added to the platform
  When the admin triggers a preload for Japanese Bronze
  Then all Bronze Japanese vocabulary words are synthesized and cached
  And the total synthesis cost is logged in tts_cost_log
  And subsequent player requests for these words hit the cache
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Audio CDN caching is an **infrastructure prerequisite for the free tier's economic viability**. If every free-tier flashcard audio request triggered a new Fish Audio synthesis call, compute costs would scale linearly with user count — destroying the margin on free accounts. By caching synthesized audio globally at Cloudflare's edge, a word spoken by one player benefits every future player encountering that same word. This is the financial architecture that allows Tong to offer genuinely unlimited text flashcards on the free tier without running a loss center.

---

## 4. Bidirectional Links

- [features.md → P-10](../features.md)
- Related specs: [[tdd_spec_proceduralContentGen.md]] (primary synthesis consumer), [[tdd_spec_intelligentFlashcards.md]] (audio playback), [[tdd_spec_tongPro.md]] (free tier economic model)
