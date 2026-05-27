# TDD Spec: Priority Worker Queue (P-09)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
Pro subscribers' post-match audio files are routed to a dedicated high-throughput Celery queue, bypassing the standard worker pool. This guarantees materially faster feedback delivery, creating a tangible, felt difference in the Pro experience.

### Queue Architecture

```
[Standard Pool]                    [Priority Pool]
celery -Q standard -c 4            celery -Q priority -c 2

Free users → standard queue        Pro users → priority queue
```

Celery supports named queues natively. Task dispatch checks `is_pro(user_id)` and routes accordingly:

```python
def dispatch_processing_job(match_id: str, user_id: str):
    queue = "priority" if is_pro(user_id) else "standard"
    process_match.apply_async(args=[match_id], queue=queue)
```

For squad matches (P-05): if any player in the match is Pro, the job goes to priority queue. (The match recording is shared; it would be unfair to have a hybrid routing.)

### SLA Targets

| Tier | Target Turnaround (match conclusion → result delivered) |
|------|---------------------------------------------------------|
| Free (first match) | < 120 seconds |
| Pro | < 30 seconds |

SLA compliance is tracked per job in `processing_jobs.completed_at - created_at`.

### Data Models

No new tables needed. Extension of `processing_jobs` (M-08):

```sql
ALTER TABLE processing_jobs ADD COLUMN queue_type TEXT NOT NULL DEFAULT 'standard';
-- 'standard' | 'priority'
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
def test_pro_user_job_dispatched_to_priority_queue():
def test_free_user_job_dispatched_to_standard_queue():
def test_squad_match_with_any_pro_member_uses_priority_queue():
def test_queue_type_recorded_in_processing_jobs():
def test_is_pro_check_called_before_dispatch():
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
Scenario: Pro user receives results faster than free user
  Given a Pro user and a free user both complete matches simultaneously
  When both upload their audio to R2
  Then the Pro user receives their result notification within 30 seconds
  And the free user receives their result notification within 120 seconds

Scenario: Admin monitors queue health
  Given a high volume of concurrent match completions
  When the admin views the queue stats dashboard
  Then they can see priority and standard queue depths separately
  And the SLA compliance percentage for the last 24 hours
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

The value of post-match feedback diminishes with time. A coaching note delivered 30 seconds after a match, while the conversation is still fresh in the player's memory, is dramatically more useful than one delivered 2 minutes later. The priority queue is not merely a quality-of-service feature — it is a **pedagogical improvement**. By guaranteeing near-instant feedback for Pro users, Tong makes the feedback loop tight enough to be actionable in the same session, reinforcing the connection between the error made and the correction received.

---

## 4. Bidirectional Links

- [features.md → P-09](../features.md)
- Related specs: [[tdd_spec_postMatchPipeline.md]] (job dispatch point), [[tdd_spec_tongPro.md]] (Pro entitlement check), [[tdd_spec_phonemeAnalysis.md]] (extended pipeline in priority queue)
