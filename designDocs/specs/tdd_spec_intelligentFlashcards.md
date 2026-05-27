# TDD Spec: Solo Grind — Intelligent Flashcards (M-03)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
A smart, error-driven spaced-repetition system. The flashcard deck is not static — it is dynamically populated by errors from micro-lessons (M-02) and post-match analysis (M-08). Cards are surfaced via a rapid swipe interface (swipe right = knew it, swipe left = missed it).

### Spaced Repetition Algorithm
Uses a simplified SM-2 variant:
- Each card has an `interval` (days until next review) and an `ease_factor` (difficulty multiplier)
- Correct response: `interval = interval * ease_factor`; ease_factor slightly increases
- Incorrect response: `interval = 1` (reset); ease_factor decreases (min 1.3)
- Cards due today: `next_review_at <= NOW()`

### Data Models

```sql
-- flashcard_items (master card definitions, shared across users)
CREATE TABLE flashcard_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    word            TEXT NOT NULL,
    translation     TEXT NOT NULL,
    example_sentence TEXT,
    audio_url       TEXT,               -- cached TTS pronunciation
    source          TEXT NOT NULL,      -- 'lesson' | 'pvp_match' | 'async_duel'
    source_ref_id   UUID,               -- card_id or match_id that created this item
    UNIQUE(language, word)
);

-- user_flashcard_queue (per-user SM-2 state for each card)
CREATE TABLE user_flashcard_queue (
    user_id         UUID REFERENCES users(id),
    item_id         UUID REFERENCES flashcard_items(id),
    interval_days   INTEGER NOT NULL DEFAULT 1,
    ease_factor     NUMERIC(4,2) NOT NULL DEFAULT 2.5,
    repetitions     INTEGER NOT NULL DEFAULT 0,
    next_review_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, item_id)
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/flashcards/due` | Bearer | Get all cards due for review today (ordered by priority) |
| POST | `/flashcards/{item_id}/review` | Bearer | Submit review result (`{quality: 0-5}`), get updated schedule |
| GET | `/flashcards/queue/stats` | Bearer | Queue size, due today count, mastered count |
| POST | `/flashcards/inject` | Internal | Add word to user's queue (called by lesson/match pipeline) |

### Injection Sources
- **From Micro-Lessons:** On wrong answer → `POST /flashcards/inject` with `source='lesson'`
- **From Post-Match Pipeline:** On mispronounced/misused word flagged by DeepSeek → `POST /flashcards/inject` with `source='pvp_match'`
- **From Async Duels:** Same as PvP match, `source='async_duel'`

Deduplication: if word already in queue, reset `interval_days = 1` (failure re-triggers review)

---

## 2. TDD Requirements

### Unit Tests

```python
# test_flashcards_unit.py
def test_sm2_correct_response_increases_interval():
def test_sm2_correct_response_increases_ease_factor():
def test_sm2_incorrect_response_resets_interval_to_1():
def test_sm2_incorrect_response_decreases_ease_factor():
def test_sm2_ease_factor_never_drops_below_1_3():
def test_sm2_interval_caps_at_maximum_configured_days():
def test_quality_5_gives_maximum_interval_growth():
def test_quality_0_resets_to_interval_1():
def test_next_review_at_calculated_correctly_from_interval():
def test_deduplication_resets_interval_on_duplicate_injection():
def test_due_cards_returns_only_cards_due_today_or_overdue():
```

### Integration Tests

```python
# test_flashcards_integration.py
def test_wrong_lesson_answer_injects_word_into_queue():
def test_review_correct_updates_sm2_state_in_db():
def test_review_incorrect_resets_sm2_state_in_db():
def test_get_due_cards_empty_for_new_user():
def test_get_due_cards_returns_cards_after_lesson_error():
def test_injecting_same_word_twice_resets_interval():
def test_queue_stats_reflect_correct_counts():
def test_pvp_match_injected_words_appear_in_queue():
def test_mastered_card_not_returned_before_next_review_date():
```

### E2E Tests

```
Scenario: Words from a lesson appear in flashcard review
  Given a player who answered 3 cards incorrectly in a lesson
  When they navigate to Flashcards
  Then all 3 words appear in their review queue
  And swiping right marks the card correct and schedules next review
  And swiping left marks incorrect and resets the card to tomorrow

Scenario: PvP match errors appear in flashcard queue
  Given a player who just finished a ranked match
  When the post-match pipeline completes
  And flagged words are injected into their queue
  Then those words appear in Flashcards the next time they open it
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Intelligent Flashcards are the **error memory** of Tong. Every mistake made anywhere in the system — whether in a quiet lesson or the heat of a ranked match — feeds directly back into this queue. No error is forgotten. The SM-2 algorithm ensures that chronic weaknesses resurface more frequently while mastered words fade gracefully into the background.

This is the mechanism that transforms isolated failures into deliberate practice: a mispronounced word in a match on Tuesday becomes a flashcard on Wednesday, drilling exactly the gap that cost the player ELO. Without this loop, the solo grind and the competitive arena remain disconnected silos. With it, every defeat is a lesson plan.

---

## 4. Bidirectional Links

- [features.md → M-03](../features.md)
- Related specs: [[tdd_spec_microLessons.md]] (injection source), [[tdd_spec_postMatchPipeline.md]] (injection source), [[tdd_spec_asyncAudioDuels.md]] (injection source)
