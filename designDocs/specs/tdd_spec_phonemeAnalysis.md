# TDD Spec: Advanced Phoneme Analysis Pipeline (P-04)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
Extends the core post-match pipeline (M-08) with a Stage 2.5 that runs between Whisper transcription and DeepSeek grading. Adds three analysis layers: wav2vec2 phoneme alignment, SpeechBrain GOP pronunciation scoring, and parselmouth F1/F2 formant analysis on flagged vowels. Output is merged into the DeepSeek grading prompt, enabling phoneme-level feedback.

### Pipeline Position (extends M-08)

```
[Stage 1 — Whisper Transcription] (existing)
      │
      ▼
[Stage 2.5 — Phoneme Analysis] ← NEW
  ├─ wav2vec2: phoneme alignment (word → phoneme sequence + timestamps)
  ├─ SpeechBrain GOP: score each phoneme against native reference
  └─ parselmouth: F1/F2 formant extraction for flagged vowels
      │
      ▼
[Stage 2 — DeepSeek Grading] (extended with phoneme data)
```

### Stage 2.5 Workers

#### wav2vec2 — Phoneme Alignment
```python
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC

def align_phonemes(audio_path: str, transcript: str, language: str):
    """
    Returns: [{word, start_sec, end_sec, phonemes: [{phoneme, start_sec, end_sec}]}]
    """
    processor = Wav2Vec2Processor.from_pretrained(LANG_MODEL_MAP[language])
    model = Wav2Vec2ForCTC.from_pretrained(LANG_MODEL_MAP[language])
    # Run CTC forced alignment
    alignment = ctc_forced_aligner(audio_path, transcript, processor, model)
    return alignment
```

#### SpeechBrain GOP — Pronunciation Scoring
```python
from speechbrain.pretrained import EncoderASR

def score_pronunciation(phoneme_alignment: list, language: str) -> list:
    """
    Returns: [{phoneme, gop_score (0-1), is_mispronounced (bool)}]
    GOP (Goodness of Pronunciation) compares speaker's phoneme log-likelihood
    against the log-likelihood of the expected phoneme.
    Threshold: gop_score < 0.4 = mispronounced
    """
    # Uses pre-cached native reference phoneme models per language
    ...
```

#### parselmouth — Formant Analysis
```python
import parselmouth
from parselmouth.praat import call

def analyze_formants(audio_segment: bytes, flagged_vowels: list[str]):
    """
    For each flagged vowel segment, extract F1/F2 formants.
    Returns: [{vowel, f1_hz, f2_hz, deviation_from_native_f1, deviation_from_native_f2}]
    Native reference formants are pre-computed and cached per language/vowel.
    """
    snd = parselmouth.Sound(audio_segment)
    formant = call(snd, "To Formant (burg)", 0, 5, 5500, 0.025, 50)
    ...
```

### Native Reference Phoneme Cache

```sql
-- native_phoneme_references (pre-computed baselines)
CREATE TABLE native_phoneme_references (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        TEXT NOT NULL,
    phoneme         TEXT NOT NULL,
    gop_baseline    NUMERIC(5,4),        -- expected GOP score for a native speaker
    f1_mean_hz      NUMERIC(8,2),        -- native F1 mean for this vowel
    f2_mean_hz      NUMERIC(8,2),        -- native F2 mean for this vowel
    f1_std_hz       NUMERIC(8,2),
    f2_std_hz       NUMERIC(8,2),
    UNIQUE(language, phoneme)
);

-- phoneme_analysis_results (per player per job)
CREATE TABLE phoneme_analysis_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID REFERENCES processing_jobs(id),
    player_id       UUID REFERENCES users(id),
    phoneme_alignment JSONB,
    gop_scores      JSONB,
    formant_data    JSONB,
    mispronounced_phonemes TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Extended DeepSeek Prompt (with phoneme data)
The existing DeepSeek grading prompt (M-08) is extended to include:
```
Phoneme Analysis for Player 1:
- Mispronounced phonemes: {list}
- GOP scores: {worst 5 phonemes}
- Formant deviations: {flagged vowels with F1/F2 deviation}

Use this phoneme data to enrich the feedback paragraph with specific pronunciation guidance.
```

---

## 2. TDD Requirements

### Unit Tests

```python
# test_phoneme_analysis_unit.py
def test_wav2vec2_returns_phoneme_timestamps_per_word():
def test_gop_score_below_threshold_marked_as_mispronounced():
def test_gop_score_above_threshold_not_flagged():
def test_formant_extraction_returns_f1_and_f2():
def test_formant_deviation_calculated_from_native_reference():
def test_mispronounced_phonemes_list_deduplicates():
def test_native_reference_cache_lookup_by_language_phoneme():
def test_pipeline_skips_formant_if_no_mispronounced_vowels():
def test_phoneme_data_merged_into_deepseek_prompt_correctly():
```

### Integration Tests

```python
# test_phoneme_analysis_integration.py
def test_stage_2_5_runs_after_whisper_in_celery_chain():
def test_phoneme_results_written_to_phoneme_analysis_results():
def test_deepseek_receives_extended_prompt_with_phoneme_data():
def test_mispronounced_words_injected_into_flashcard_queue():
def test_pro_user_job_includes_stage_2_5():
def test_free_user_job_skips_stage_2_5():    # phoneme analysis is Pro-only
def test_formant_data_available_in_linguistic_analytics():
```

### E2E Tests

```
Scenario: Pro user receives phoneme-level feedback after match
  Given a Pro user completes a live ranked match
  When the full pipeline processes their audio
  Then the result screen shows:
    - Specific mispronounced phonemes (e.g., "the /r/ in 'rojo' was pronounced as /l/")
    - F1/F2 deviation for flagged vowels
    - An actionable coaching note per mispronunciation
  And mispronounced words appear in their flashcard queue
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The phoneme pipeline answers the question that players ask after every match: "I know I made mistakes — but *which* mistakes, exactly?" WPM and grammar feedback is valuable, but it operates at the sentence level. Phoneme analysis operates at the sound level — it tells a player that their /r/ is being realized as /l/, that their vowel formants are 15% off-target for the target dialect, that their specific accent deviations are concentrated in back vowels. This level of precision transforms Tong from a feedback system into a **pronunciation coach** — one available 24/7, powered by every match played.

---

## 4. Bidirectional Links

- [features.md → P-04](../features.md)
- Related specs: [[tdd_spec_postMatchPipeline.md]] (extends Stage 2.5), [[tdd_spec_linguisticAnalytics.md]] (formant trend data), [[tdd_spec_tongPro.md]] (Pro-only gate), [[tdd_spec_intelligentFlashcards.md]] (word injection)
