# TDD Spec: Linguistic Analytics Dashboard (P-08)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
A Pro-exclusive dashboard surfacing long-term trends in language performance: WPM progression, phoneme accuracy over time, F1/F2 formant convergence toward native targets, custom LLM-generated remedial tracks, and vocabulary growth curves. Data is aggregated from the post-match pipeline (M-08) and phoneme analysis (P-04).

### Dashboard Modules

| Module | Metric | Source |
|--------|--------|--------|
| WPM Trend | Words-per-minute over last N matches | transcripts.wpm |
| Filler Word Reduction | Filler word count trend over time | DeepSeek grading output |
| Phoneme Accuracy Heatmap | Per-phoneme GOP score trend | phoneme_analysis_results.gop_scores |
| Vowel Formant Convergence | F1/F2 deviation from native, over time | phoneme_analysis_results.formant_data |
| Vocabulary Growth | Unique words used correctly per week | user_vocabulary confidence > 0.5 |
| Remedial Track | AI-generated study recommendations | DeepSeek synthesis |

### Data Aggregation

Analytics data is materialized on a schedule (not computed on-request) to keep API latency low:

```sql
-- analytics_snapshots (materialized weekly per user)
CREATE TABLE analytics_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    language        TEXT NOT NULL,
    snapshot_date   DATE NOT NULL,          -- always a Monday (weekly granularity)
    avg_wpm         NUMERIC(6,2),
    avg_filler_count NUMERIC(6,2),
    phoneme_scores  JSONB,                   -- {phoneme: avg_gop_score}
    formant_data    JSONB,                   -- {vowel: {f1_deviation, f2_deviation}}
    vocab_size      INTEGER,                 -- unique words with confidence > 0.5
    UNIQUE(user_id, language, snapshot_date)
);
```

Celery Beat task runs every Monday to aggregate the past week's data into `analytics_snapshots`.

### Remedial Track Generation

```python
async def generate_remedial_track(user_id: str, language: str) -> dict:
    """
    Analyzes last 4 weeks of analytics_snapshots and phoneme_analysis_results.
    Returns a structured study plan:
    {
        "weak_phonemes": ["ɾ", "β", "ð"],
        "weak_vocabulary_domains": ["subjunctive verbs", "formal address"],
        "recommended_actions": [
            "Practice the /ɾ/ tap consonant — your GOP score has been < 0.4 for 3 weeks",
            "Queue 15 minutes of Silver flashcards focused on subjunctive verb forms",
        ],
        "estimated_improvement_weeks": 3
    }
    """
    snapshots = db.get_last_n_snapshots(user_id, language, n=4)
    phoneme_history = db.get_phoneme_history(user_id, language, days=28)
    prompt = build_remedial_track_prompt(snapshots, phoneme_history)
    return await deepseek_client.chat_json(prompt)
```

Remedial track is regenerated weekly (on the same Monday job) and cached per user.

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/me/wpm` | Bearer (Pro) | WPM trend, last N weeks (default 8) |
| GET | `/analytics/me/fillers` | Bearer (Pro) | Filler word trend |
| GET | `/analytics/me/phonemes` | Bearer (Pro) | Phoneme accuracy heatmap data |
| GET | `/analytics/me/formants` | Bearer (Pro) | Vowel formant convergence data |
| GET | `/analytics/me/vocabulary` | Bearer (Pro) | Vocabulary size growth curve |
| GET | `/analytics/me/remedial` | Bearer (Pro) | Latest remedial track |
| POST | `/analytics/me/remedial/refresh` | Bearer (Pro) | Manually regenerate remedial track |

All endpoints return `403 Forbidden` for non-Pro users with a `{"upgrade_required": true}` body.

---

## 2. TDD Requirements

### Unit Tests

```python
# test_linguistic_analytics_unit.py
def test_wpm_trend_aggregates_last_n_matches_correctly():
def test_filler_word_trend_computes_weekly_average():
def test_phoneme_heatmap_averages_gop_scores_per_phoneme():
def test_formant_deviation_trend_shows_convergence_over_time():
def test_vocab_size_counts_only_high_confidence_words():
def test_remedial_track_prompt_built_from_snapshot_data():
def test_remedial_track_cached_and_not_regenerated_within_week():
def test_analytics_endpoint_returns_403_for_free_user():
def test_analytics_endpoint_returns_data_for_pro_user():
```

### Integration Tests

```python
# test_linguistic_analytics_integration.py
def test_weekly_celery_task_creates_analytics_snapshot():
def test_snapshot_aggregates_correct_data_from_transcripts():
def test_snapshot_aggregates_correct_data_from_phoneme_results():
def test_remedial_track_endpoint_returns_cached_track():
def test_remedial_refresh_regenerates_and_updates_cache():
def test_wpm_trend_returns_correct_time_series():
def test_formant_data_shows_decreasing_deviation_for_improving_player():
```

### E2E Tests

```
Scenario: Pro user views their phoneme heatmap
  Given a Pro user who has played 10 matches
  When they navigate to the Analytics dashboard
  Then they see a heatmap of all phonemes in their target language
  And each phoneme is colored by their average GOP score (red = weak, green = strong)
  And tapping a phoneme shows a trend line for that phoneme over the last 8 weeks

Scenario: Remedial track is generated for a struggling player
  Given a Pro user with consistently low GOP scores on /ɾ/ for 4 weeks
  When the Monday analytics job runs
  Then a remedial track is generated identifying /ɾ/ as the priority weakness
  And the recommended actions include specific flashcard focus areas
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The analytics dashboard answers the question that serious competitors always ask: **"Am I actually getting better?"** WPM numbers going up, formant deviations converging toward the native target, phoneme heatmap shifting from red to green — these are the measurable signals of genuine linguistic progress. The remedial track closes the loop between diagnosis and action: it doesn't just show the player where they are weak, it tells them exactly what to do about it. This is the Pro tier's deepest value proposition — not just more matches analyzed, but a personalized coach who reads every match.

---

## 4. Bidirectional Links

- [features.md → P-08](../features.md)
- Related specs: [[tdd_spec_postMatchPipeline.md]] (WPM, filler data source), [[tdd_spec_phonemeAnalysis.md]] (phoneme + formant data source), [[tdd_spec_tongPro.md]] (access gate), [[tdd_spec_dynamicPrompts.md]] (vocabulary confidence data)
