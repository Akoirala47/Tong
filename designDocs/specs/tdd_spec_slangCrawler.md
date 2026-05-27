# TDD Spec: Automated Slang Content Engine (P-01)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
A daily automated pipeline that crawls regional social media (TikTok transcripts, X/Twitter) for emerging slang and contemporary idioms in the target language, filters them for CEFR-appropriateness via DeepSeek, and stores validated terms in a vector database to keep both matchmaking prompts and lesson content current.

### Pipeline Architecture

```
[Celery Beat — daily schedule, per language]
      │
      ▼
[Stage 1: Scraper Workers]
  - TikTok: Apify TikTok scraper API → transcript extraction per regional hashtag
  - X (Twitter): X API v2 → search trending terms per language locale
  Output: raw_slang_candidates table rows
      │
      ▼
[Stage 2: DeepSeek-V4-Flash Filtering]
  Prompt: "Given these candidate slang terms from {locale}, classify each as:
            1. CEFR level (A1/A2/B1/B2/C1/C2 or 'unclassifiable')
            2. Formality (casual/slang/vulgar)
            3. Valid: true/false (false = offensive, incomprehensible, or too niche)
            Return JSON array."
  Output: validated terms with CEFR metadata
      │
      ▼
[Stage 3: Embedding + Upsert]
  - Embed each validated term using text-embedding model (OpenAI ada-002 or DeepSeek embed)
  - Upsert into pgvector table with metadata
  - Deduplicate against existing terms (cosine similarity > 0.95 = duplicate)
```

### Data Models

```sql
-- raw_slang_candidates (staging table, cleared per run)
CREATE TABLE raw_slang_candidates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    locale          TEXT NOT NULL,       -- 'es-MX', 'ja-JP', etc.
    term            TEXT NOT NULL,
    example_usage   TEXT,
    source          TEXT NOT NULL,       -- 'tiktok' | 'twitter'
    source_url      TEXT,
    scraped_at      TIMESTAMPTZ DEFAULT NOW()
);

-- slang_terms (validated, production)
CREATE TABLE slang_terms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    locale          TEXT NOT NULL,
    term            TEXT NOT NULL,
    translation     TEXT,
    example_sentence TEXT,
    cefr_level      TEXT NOT NULL,
    formality       TEXT NOT NULL,       -- 'casual' | 'slang'
    embedding       vector(1536),        -- pgvector column
    active          BOOLEAN DEFAULT TRUE,
    first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(language, locale, term)
);

-- crawler_run_logs
CREATE TABLE crawler_run_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    locale          TEXT NOT NULL,
    candidates_found INTEGER,
    terms_validated INTEGER,
    terms_added     INTEGER,
    terms_deduplicated INTEGER,
    run_at          TIMESTAMPTZ DEFAULT NOW(),
    status          TEXT,                -- 'success' | 'partial' | 'failed'
    error_message   TEXT
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/slang/terms` | Internal | Query slang terms by language/locale/CEFR |
| GET | `/slang/terms/similar` | Internal | Vector similarity search (for JIT prompt injection) |
| POST | `/slang/crawler/trigger` | Admin | Manually trigger a crawl run for a locale |
| GET | `/slang/crawler/logs` | Admin | Crawl run history and statistics |

---

## 2. TDD Requirements

### Unit Tests

```python
# test_slang_crawler_unit.py
def test_tiktok_scraper_parses_transcript_from_api_response():
def test_twitter_scraper_extracts_text_from_tweet_objects():
def test_deepseek_filter_parses_json_response_correctly():
def test_deepseek_filter_rejects_vulgar_terms():
def test_deepseek_filter_assigns_cefr_level():
def test_embedding_cosine_similarity_detects_duplicate():
def test_duplicate_term_updates_last_seen_not_inserts():
def test_new_term_inserts_with_correct_metadata():
def test_crawler_log_written_on_completion():
def test_crawler_log_written_on_failure():
def test_rate_limit_handling_on_tiktok_api():
def test_rate_limit_handling_on_twitter_api():
```

### Integration Tests

```python
# test_slang_crawler_integration.py
def test_celery_beat_schedules_daily_crawl_per_language():
def test_full_pipeline_inserts_new_terms_into_slang_terms():
def test_full_pipeline_deduplicates_existing_terms():
def test_vector_similarity_search_returns_relevant_terms():
def test_admin_manual_trigger_runs_crawl_synchronously():
def test_crawler_log_reflects_accurate_counts():
def test_failed_deepseek_call_marks_run_as_partial():
```

### E2E Tests

```
Scenario: Daily crawl populates new slang terms
  Given the crawler is triggered for 'es-MX' locale
  When the pipeline completes
  Then new validated slang terms appear in the slang_terms table
  And each term has a CEFR level, formality, and embedding
  And the crawler log shows success with term counts

Scenario: JIT prompt system retrieves fresh slang
  Given the slang_terms table has been populated for 'ja-JP'
  When a matchmaking prompt is generated for two Japanese learners
  Then the prompt contains at least one term from slang_terms
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The slang crawler keeps Tong's competitive meta **alive and current**. A language is not a static textbook — it evolves daily on TikTok and X. When a player learns a slang term through a match prompt, that term is one they will encounter in a real conversation with a native speaker next week. Static content decks age out within months; the crawler ensures the vocabulary in every Tong match reflects how people actually speak right now.

---

## 4. Bidirectional Links

- [features.md → P-01](../features.md)
- Related specs: [[tdd_spec_dynamicPrompts.md]] (consumes slang_terms), [[tdd_spec_proceduralContentGen.md]] (may inject slang into lesson sentences)
