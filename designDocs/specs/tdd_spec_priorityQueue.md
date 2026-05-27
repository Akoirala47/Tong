# TDD Spec: Priority Worker Queue (P-09)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.
> Queue routing defined in [[tdd_spec_computeEconomics.md]]; `queue_type` column created in M-08.

---

## 1. Technical Specification

### Overview
Pro and Elite subscribers' post-match jobs route to dedicated GPU Celery queues, bypassing the CPU standard pool used by Free and Plus users. Three queues total — `standard` (CPU), `qwen` (GPU/vLLM for Pro), `elite_gpu` (GPU/faster-whisper for Elite).

### Queue Architecture

```
[Standard Pool — CPU]       [Qwen Pool — GPU/vLLM]    [Elite Pool — GPU]
celery -Q standard -c 4     celery -Q qwen -c 2        celery -Q elite_gpu -c 2

Free/Plus → standard        Pro → qwen                  Elite → elite_gpu
metadata_only, lite         full                         elite, elite_phoneme
```

Celery supports named queues natively. Task dispatch is integrated in `dispatch_processing_job()` (M-08):

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
    process_match.apply_async(args=[source_id, source_type, tier], queue=queue)
```

For squad matches (P-05): if any player in the match is Pro or Elite, the job goes to the highest-priority queue available.

### SLA Targets

| Subscription | Pipeline | Queue | Target Turnaround |
|-------------|----------|-------|-------------------|
| Free / Plus (lite) | `lite` on standard/CPU | `standard` | < 120 seconds |
| Free / Plus (metadata) | `metadata_only` on standard | `standard` | < 30 seconds |
| Pro | `full` (Qwen) on GPU | `qwen` | < 30 seconds |
| Elite | `elite`, `elite_phoneme` on GPU | `elite_gpu` | < 30 seconds |

SLA compliance is tracked per job in `processing_jobs.completed_at - created_at`.

### Data Models

`queue_type` on `processing_jobs` is created in **M-08** migration. P-09 deploys dedicated GPU workers for the `priority` queue:

```sql
-- Already on processing_jobs from M-08:
-- queue_type TEXT NOT NULL DEFAULT 'standard'  -- 'standard' | 'qwen' | 'elite_gpu'
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/queue/stats` | Admin | Current queue depths for standard and priority pools |
| GET | `/admin/queue/sla` | Admin | SLA compliance stats (% of jobs within target, last 24h) |

### Worker Scaling Strategy
- Priority pool: always-on 2 workers (Railway or ECS service with min=2)
- Standard pool: auto-scales based on queue depth (Railway's autoscale or ECS target tracking on queue depth)
- Priority workers are not shared with the standard queue — no starvation possible

---

## 2. TDD Requirements

### Unit Tests

```python
# test_priority_queue_unit.py
def test_pro_user_job_dispatched_to_qwen_queue():
def test_elite_user_job_dispatched_to_elite_gpu_queue():
def test_free_user_job_dispatched_to_standard_queue():
def test_plus_user_job_dispatched_to_standard_queue():
def test_squad_match_with_any_pro_or_elite_member_uses_priority_queue():
def test_queue_type_recorded_in_processing_jobs():
def test_subscription_tier_check_called_before_dispatch():
```

### Integration Tests

```python
# test_priority_queue_integration.py
def test_priority_queue_job_picked_up_before_standard_queue_job():
    # Flood standard queue, then add a priority job, verify it completes first
def test_processing_job_records_correct_queue_type():
def test_admin_queue_stats_returns_accurate_depths():
def test_sla_tracking_records_completion_time():
def test_standard_queue_backlog_does_not_delay_priority_jobs():
```

### E2E Tests

```
Scenario: Pro and Elite users receive results faster than free users
  Given a Pro user, an Elite user, and a free user all complete matches simultaneously
  When all upload their audio to R2
  Then the Pro user receives their result notification within 30 seconds (Qwen queue)
  And the Elite user receives their result notification within 30 seconds (Elite GPU queue)
  And the free user receives their result notification within 120 seconds (standard CPU queue)

Scenario: Admin monitors queue health
  Given a high volume of concurrent match completions
  When the admin views the queue stats dashboard
  Then they can see priority and standard queue depths separately
  And the SLA compliance percentage for the last 24 hours
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The value of post-match feedback diminishes with time. A coaching note delivered 30 seconds after a match, while the conversation is still fresh in the player's memory, is dramatically more useful than one delivered 2 minutes later. The priority queues are not merely a quality-of-service feature — they are a **pedagogical improvement**. By guaranteeing near-instant feedback for Pro and Elite users, Tong makes the feedback loop tight enough to be actionable in the same session, reinforcing the connection between the error made and the correction received.

---

## 4. Bidirectional Links

- [features.md → P-09](../features.md)
- Related specs: [[tdd_spec_postMatchPipeline.md]] (job dispatch point), [[tdd_spec_computeEconomics.md]] (queue/tier rules), [[tdd_spec_tongPro.md]] (Pro entitlement check), [[tdd_spec_phonemeAnalysis.md]] (extended pipeline in priority queue)
