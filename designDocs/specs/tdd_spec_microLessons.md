# TDD Spec: Solo Grind — Micro-Lessons (M-02)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
Bite-sized, interactive drills teaching vocabulary, grammar, and sentence structures scoped to the player's current ELO bracket tier. Each lesson session is a fixed sequence of exercise cards drawn from the current tier's content graph.

### Content Model

Lesson content is organized as a **Tier Dependency Graph**: each tier (Bronze, Silver, Gold…) has a vocabulary set and grammar rule set. Within a tier, lessons are sequential chapters; chapters contain exercise cards.

```sql
-- content_tiers
CREATE TABLE content_tiers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language    TEXT NOT NULL,           -- 'es', 'ja', etc.
    tier_name   TEXT NOT NULL,           -- 'Bronze', 'Silver', etc.
    tier_order  INTEGER NOT NULL,
    cefr_level  TEXT NOT NULL            -- 'A1', 'A2', 'B1', etc.
);

-- lessons
CREATE TABLE lessons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id     UUID REFERENCES content_tiers(id),
    chapter     INTEGER NOT NULL,
    title       TEXT NOT NULL,
    focus       TEXT NOT NULL            -- 'vocabulary' | 'grammar' | 'pronunciation'
);

-- exercise_cards
CREATE TABLE exercise_cards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id       UUID REFERENCES lessons(id),
    card_type       TEXT NOT NULL,       -- 'translate' | 'fill_blank' | 'multiple_choice' | 'audio_match'
    prompt_text     TEXT NOT NULL,
    prompt_audio_url TEXT,               -- cached Fish Audio S2 URL (Post-MVP)
    answer_text     TEXT NOT NULL,
    distractors     JSONB,               -- for multiple_choice: ["wrong1", "wrong2", "wrong3"]
    target_words    TEXT[],              -- vocabulary words this card trains
    position        INTEGER NOT NULL
);

-- user_lesson_progress
CREATE TABLE user_lesson_progress (
    user_id         UUID REFERENCES users(id),
    lesson_id       UUID REFERENCES lessons(id),
    completed_at    TIMESTAMPTZ,
    score           NUMERIC(5,2),        -- 0.00–100.00
    PRIMARY KEY (user_id, lesson_id)
);

-- user_card_responses
CREATE TABLE user_card_responses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    card_id     UUID REFERENCES exercise_cards(id),
    is_correct  BOOLEAN NOT NULL,
    response    TEXT,
    time_taken_ms INTEGER,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/lessons/current` | Bearer | Get next unlocked lesson for user's tier |
| GET | `/lessons/{lesson_id}` | Bearer | Get lesson with all exercise cards |
| POST | `/lessons/{lesson_id}/start` | Bearer | Create a lesson session |
| POST | `/lessons/{lesson_id}/cards/{card_id}/answer` | Bearer | Submit an answer, get result + XP |
| POST | `/lessons/{lesson_id}/complete` | Bearer | Finalize lesson, store score, award XP |
| GET | `/lessons/tier/{tier_name}` | Bearer | List all chapters in a tier |

### Lesson Session Flow
1. Client fetches lesson → receives ordered array of `exercise_cards`
2. For each card, user submits answer → server validates, returns `{is_correct, correct_answer, xp_earned}`
3. Wrong answers → card ID queued for flashcard injection (see M-03)
4. On `complete`, server calculates lesson score, awards XP, unlocks next lesson

---

## 2. TDD Requirements

### Unit Tests

```python
# test_micro_lessons_unit.py
def test_answer_validation_translate_card_exact_match():
def test_answer_validation_translate_card_case_insensitive():
def test_answer_validation_translate_card_trim_whitespace():
def test_answer_validation_multiple_choice_correct_option():
def test_answer_validation_multiple_choice_wrong_option():
def test_xp_award_correct_first_try_gives_full_xp():
def test_xp_award_correct_second_try_gives_partial_xp():
def test_xp_award_incorrect_gives_zero_xp():
def test_lesson_score_calculation_all_correct_is_100():
def test_lesson_score_calculation_half_correct_is_50():
def test_wrong_answer_queues_card_for_flashcard_injection():
def test_lesson_unlocks_next_chapter_on_completion():
```

### Integration Tests

```python
# test_micro_lessons_integration.py
def test_get_current_lesson_returns_correct_tier_for_bronze_player():
def test_get_current_lesson_returns_correct_tier_for_gold_player():
def test_submit_answer_persists_user_card_response():
def test_complete_lesson_awards_xp_and_updates_profile():
def test_complete_lesson_writes_to_user_lesson_progress():
def test_all_wrong_answers_inject_all_cards_into_flashcard_queue():
def test_cannot_access_lesson_above_players_current_tier():
def test_replaying_completed_lesson_still_awards_partial_xp():
```

### E2E Tests

```
Scenario: Player completes a full micro-lesson
  Given a Bronze-tier player with no completed lessons
  When they navigate to Solo Grind and start Lesson 1
  And answer all cards (mix of correct and incorrect)
  Then they see a lesson summary screen with their score
  And their XP counter updates in the header
  And incorrect words appear in their Flashcard queue

Scenario: Player is gated from a lesson above their tier
  Given a Bronze player
  When they navigate directly to a Gold lesson
  Then they see a "Unlock by reaching Gold rank" message
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Micro-lessons are the **vocabulary arsenal** — without them, the player enters a live match without ammunition. But they must never become a comfort zone. The tier-locking mechanism ensures lesson content is always calibrated to the player's current competitive bracket, so the vocabulary they grind is exactly the vocabulary they will need in their next ranked match. The mandatory error-injection into flashcards (M-03) means every mistake made in the quiet of a lesson becomes active remediation — no error is wasted.

---

## 4. Bidirectional Links

- [features.md → M-02](../features.md)
- Related specs: [[tdd_spec_intelligentFlashcards.md]] (wrong answer injection), [[tdd_spec_bossBattles.md]] (tier gating), [[tdd_spec_gamification.md]] (XP awards)
