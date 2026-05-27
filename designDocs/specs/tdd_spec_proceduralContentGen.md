# TDD Spec: Procedural Solo Content Generation (P-02)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
Replaces hand-authored static exercise cards with on-demand procedurally generated content. A language rule dependency graph drives sentence synthesis, combining structural grammar nodes with vocabulary nodes. Fish Audio S2 generates native-quality audio for each sentence. This eliminates the content bottleneck and enables infinite unique drill variations.

### Language Rule Dependency Graph

Each language's content is represented as a directed acyclic graph (DAG):
- **Structure Nodes:** Grammar templates (e.g., `[SUBJECT] [VERB] [OBJECT] [LOCATION]`)
- **Vocabulary Nodes:** Lexical items tagged by CEFR level, topic domain, and tier
- **Edge Weights:** Represent valid combinations (not all vocabulary is valid in all structures)

The graph is stored in the database and authored by linguists during onboarding. The procedural engine samples from this graph to produce unique sentences.

### Data Models

```sql
-- grammar_templates
CREATE TABLE grammar_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    tier_id         UUID REFERENCES content_tiers(id),
    template        TEXT NOT NULL,       -- e.g. "{subject} {verb} {object} en {location}"
    slot_types      JSONB NOT NULL,      -- {"subject":"noun_pronoun","verb":"verb_motion","object":"noun","location":"place"}
    focus           TEXT NOT NULL        -- 'vocabulary' | 'grammar' | 'pronunciation'
);

-- vocabulary_nodes
CREATE TABLE vocabulary_nodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    word            TEXT NOT NULL,
    pos_tag         TEXT NOT NULL,       -- 'noun' | 'verb' | 'adjective' | etc.
    slot_type       TEXT NOT NULL,       -- matches grammar_templates.slot_types values
    cefr_level      TEXT NOT NULL,
    tier_id         UUID REFERENCES content_tiers(id),
    topic_domains   TEXT[],              -- ['food', 'travel', 'sports']
    conjugations    JSONB               -- verb forms, noun plural, etc.
);

-- generated_cards (cache of generated exercise cards)
CREATE TABLE generated_cards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     UUID REFERENCES grammar_templates(id),
    language        TEXT NOT NULL,
    tier_id         UUID REFERENCES content_tiers(id),
    sentence        TEXT NOT NULL,
    translation     TEXT NOT NULL,
    audio_url       TEXT,                -- Fish Audio S2 cached URL
    card_type       TEXT NOT NULL,
    target_words    TEXT[],
    generation_seed TEXT,                -- reproducible generation fingerprint
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/content/generate` | Internal | Generate N exercise cards for a tier (checks cache first) |
| POST | `/content/synthesize-audio` | Internal | Request Fish Audio S2 TTS for a generated sentence |
| GET | `/content/templates` | Admin | List grammar templates for a language |
| POST | `/content/templates` | Admin | Create a grammar template |

### Generation Flow

```
Request for tier content
      │
      ▼
Sample grammar_templates for tier → pick template
      │
      ▼
For each slot in template:
  Query vocabulary_nodes by slot_type + tier_id
  Apply conjugation rules
      │
      ▼
Assemble sentence + translation
      │
      ▼
Check generated_cards cache (hash of template_id + vocab_ids)
      │
      ├─ Cache HIT: return existing card (audio_url already set)
      │
      └─ Cache MISS:
              Insert generated_cards row
              Dispatch Celery task: synthesize_audio(card_id)
              Return card (audio_url=null; client shows text-only until audio ready)
```

### Fish Audio S2 Integration

```python
import fish_audio_sdk

async def synthesize_card_audio(card_id: str, sentence: str, language: str):
    session = fish_audio_sdk.Session(api_key=settings.FISH_AUDIO_API_KEY)
    # Use language-appropriate reference voice
    voice_id = LANGUAGE_VOICE_MAP[language]
    audio_bytes = await session.tts(sentence, reference_id=voice_id)
    # Upload to R2
    audio_url = await upload_to_r2(audio_bytes, f"tts/{card_id}.ogg")
    await db.update_card_audio_url(card_id, audio_url)
```

---

## 2. TDD Requirements

### Unit Tests

```python
# test_procedural_content_unit.py
def test_template_slot_resolution_fills_all_slots():
def test_vocabulary_sampling_respects_slot_type():
def test_vocabulary_sampling_respects_tier_level():
def test_sentence_assembly_applies_conjugation_rules():
def test_generation_fingerprint_is_reproducible():
def test_cache_hit_detected_by_fingerprint():
def test_cache_miss_triggers_audio_synthesis_task():
def test_fish_audio_response_uploaded_to_r2():
def test_card_with_null_audio_url_still_returned():
def test_generated_cards_are_grammatically_unique():
```

### Integration Tests

```python
# test_procedural_content_integration.py
def test_generate_returns_cards_from_correct_tier():
def test_generate_returns_cached_card_on_repeat_request():
def test_celery_task_sets_audio_url_on_generated_card():
def test_admin_can_create_new_grammar_template():
def test_new_template_used_in_generation_immediately():
def test_slang_terms_can_be_injected_as_vocabulary_nodes():
```

### E2E Tests

```
Scenario: Player receives procedurally generated lesson content
  Given a Silver-tier player starts a lesson
  When the server generates exercise cards
  Then each card has a unique sentence not seen before
  And the audio for common cards plays from CDN cache
  And new sentences have audio synthesized within 5 seconds

Scenario: Linguist adds a new grammar template
  Given an admin creates a new grammar template for 'es' Silver tier
  When a player requests lesson content
  Then the new template's sentence structure appears in the rotation
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Static content decks have a ceiling — players exhaust them and plateau. Procedural generation ensures that no two lesson sessions are identical, preventing the "I've memorized the answers" anti-pattern that plagues flashcard apps. When the vocabulary nodes are fed by the slang crawler (P-01), the solo grind becomes a live pipeline from the internet into the player's drilling queue — every trending term on TikTok eventually becomes a Tong flashcard.

---

## 4. Bidirectional Links

- [features.md → P-02](../features.md)
- Related specs: [[tdd_spec_microLessons.md]] (replaces static cards), [[tdd_spec_slangCrawler.md]] (vocabulary node source), [[tdd_spec_audioCDN.md]] (audio caching layer)
