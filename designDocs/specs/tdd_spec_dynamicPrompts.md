# TDD Spec: Dynamic JIT Matchmaking Prompts (P-03)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
Just-In-Time (JIT) prompt generation replaces the static prompt pool used at MVP. When two players are matched, the system cross-references their vocabulary profiles to find their shared known vocabulary, then uses DeepSeek-V4-Flash to generate a custom conversational scenario that targets that intersection — deliberately injecting one or two fresh slang terms from the crawler database to challenge both players.

### Design Goals
1. **Fairness:** Prompt uses vocabulary both players have demonstrated knowledge of — no player is disadvantaged by unknowns
2. **Challenge:** One or two slang terms from the crawler are injected that neither player has seen before — productive surprise
3. **Relevance:** Prompt scenario is contextually appropriate (e.g., not asking B1 players to debate philosophy)
4. **Speed:** Prompt must be ready before both players finish the lobby countdown (~10 seconds)

### Vocabulary Overlap Calculation

```python
def calculate_vocabulary_overlap(player1_id: str, player2_id: str, language: str) -> list[str]:
    """
    Returns list of words both players have demonstrated knowledge of.
    'Demonstrated knowledge' = correct answer in lesson/flashcard within last 30 days OR
                               no flags in post-match transcript for this word.
    """
    p1_vocab = get_known_vocabulary(player1_id, language)
    p2_vocab = get_known_vocabulary(player2_id, language)
    return list(p1_vocab & p2_vocab)  # set intersection
```

Vocabulary knowledge is stored in a denormalized `user_vocabulary` table for fast lookup:

```sql
-- user_vocabulary (denormalized knowledge state)
CREATE TABLE user_vocabulary (
    user_id         UUID REFERENCES users(id),
    language        TEXT NOT NULL,
    word            TEXT NOT NULL,
    known_since     TIMESTAMPTZ NOT NULL,
    last_confirmed  TIMESTAMPTZ NOT NULL,
    confidence      NUMERIC(4,3) NOT NULL DEFAULT 0.5,   -- 0-1
    PRIMARY KEY (user_id, language, word)
);
```

Confidence is updated via:
- Correct flashcard review → `confidence += 0.1` (max 1.0)
- Incorrect flashcard review → `confidence -= 0.2` (min 0.0)
- Word appears unflagged in post-match → `confidence += 0.05`
- Word flagged in post-match → `confidence -= 0.15`

Words with `confidence < 0.3` are excluded from the overlap calculation.

### JIT Prompt Generation

```python
async def generate_match_prompt(
    overlap_vocab: list[str],
    slang_injections: list[str],  # 1-2 terms from slang_terms table
    cefr_level: str,
    language: str
) -> str:
    prompt = f"""
    You are designing a conversational roleplay scenario for a competitive language-learning app.
    Language: {language}
    CEFR Level: {cefr_level}
    
    The two players share knowledge of these words: {', '.join(overlap_vocab[:50])}
    
    Additionally, introduce these new slang terms naturally into the scenario: {', '.join(slang_injections)}
    
    Generate a single conversational prompt/roleplay scenario (2-3 sentences max) that:
    1. Uses vocabulary from the shared list
    2. Naturally introduces the slang terms with enough context to infer their meaning
    3. Is engaging, specific, and has clear conversational stakes
    4. Is appropriate for the CEFR level
    
    Return ONLY the prompt text, no explanation.
    """
    response = await deepseek_client.chat(prompt)
    return response.text
```

### Slang Injection Selection
- Query `slang_terms` for language/locale-appropriate terms at player's CEFR level
- Select 1-2 terms that neither player has seen in their past 30 match prompts (checked via `user_seen_slang` table)
- Prefer terms with `active=true` and high recency (`first_seen_at DESC`)

### Data Models

```sql
-- match_prompts (stores generated prompt per match for audit + analysis)
CREATE TABLE match_prompts (
    match_id        UUID PRIMARY KEY,   -- live_match or async_duel ID
    prompt_text     TEXT NOT NULL,
    overlap_words   TEXT[],
    injected_slang  TEXT[],
    generated_at    TIMESTAMPTZ DEFAULT NOW(),
    generation_ms   INTEGER             -- latency tracking
);

-- user_seen_slang (prevents slang term repetition)
CREATE TABLE user_seen_slang (
    user_id         UUID REFERENCES users(id),
    slang_term_id   UUID REFERENCES slang_terms(id),
    seen_at         TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, slang_term_id)
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/prompts/generate` | Internal | Generate JIT prompt for a matched pair |
| GET | `/prompts/{match_id}` | Bearer | Get the prompt for a specific match |

---

## 2. TDD Requirements

### Unit Tests

```python
# test_dynamic_prompts_unit.py
def test_vocabulary_overlap_returns_intersection_only():
def test_low_confidence_words_excluded_from_overlap():
def test_slang_injection_selects_unseen_terms():
def test_slang_injection_never_repeats_last_30_days():
def test_prompt_generation_called_with_overlap_and_slang():
def test_prompt_generation_returns_under_200_words():
def test_confidence_increases_on_correct_flashcard():
def test_confidence_decreases_on_incorrect_flashcard():
def test_confidence_capped_at_1_0():
def test_confidence_floored_at_0_0():
def test_user_seen_slang_written_after_prompt_generation():
```

### Integration Tests

```python
# test_dynamic_prompts_integration.py
def test_prompt_generated_and_stored_on_match_creation():
def test_prompt_retrieval_by_match_id():
def test_vocabulary_overlap_queries_user_vocabulary_correctly():
def test_slang_injection_queries_slang_terms_table():
def test_prompt_generation_completes_within_10_seconds():
def test_fallback_to_static_prompt_if_deepseek_fails():
def test_match_prompt_logs_generation_latency():
```

### E2E Tests

```
Scenario: Two matched players receive a personalized prompt
  Given two players matched in the ranked queue
  When the lobby screen appears
  Then the prompt displayed is unique to this match
  And contains vocabulary that both players have studied
  And introduces one new slang term contextually

Scenario: Fallback on DeepSeek timeout
  Given the DeepSeek API is unresponsive
  When a match is created
  Then a prompt is drawn from the static fallback pool
  And the match proceeds without delay
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Static prompts are learnable — a player who queues 50 times will eventually recognize familiar scenarios and prepare canned responses. JIT prompts ensure that **no match is the same**. The vocabulary intersection guarantee means the player is always working within their competence zone but is always surprised by one or two terms at the edge of it. This is the "zone of proximal development" (Vygotsky) operationalized at the match level: calibrated challenge, not random difficulty.

---

## 4. Bidirectional Links

- [features.md → P-03](../features.md)
- Related specs: [[tdd_spec_liveRankedBattles.md]] (prompt consumer), [[tdd_spec_asyncAudioDuels.md]] (prompt consumer), [[tdd_spec_slangCrawler.md]] (slang injection source), [[tdd_spec_intelligentFlashcards.md]] (confidence score updates)
