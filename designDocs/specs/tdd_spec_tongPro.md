# TDD Spec: Tong Subscription Tiers (P-07)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.
> Pricing and pipeline tiers: [[tdd_spec_computeEconomics.md]] (canonical)

---

## 1. Technical Specification

### Overview

Three paid subscription tiers — Plus, Pro, and Elite — on top of a free tier. Monetization gates **analysis depth and pipeline quality**, not core gameplay. Free users get genuine daily coaching; paid tiers remove caps, upgrade the ASR engine, and add analytics depth.

### Pricing

| Tier | Gross price | Net after ~15% store fee | SKU |
|------|------------|--------------------------|-----|
| **Plus** | $9.99/mo | ~$8.49 | `tong_plus_monthly_999` |
| **Pro** | $15.99/mo | ~$13.59 | `tong_pro_monthly_1599` |
| **Elite** | $19.99/mo | ~$16.99 | `tong_elite_monthly_1999` |

### Tier Comparison

| Feature | Free | Plus $9.99 | Pro $15.99 | Elite $19.99 |
|---------|------|-----------|-----------|------------|
| Micro-lessons | Unlimited | Unlimited | Unlimited | Unlimited |
| Flashcard audio | Text only | Yes | Yes | Yes |
| Boss Battles | Unlimited | Unlimited | Unlimited | Unlimited |
| Async Duels (active) | 3 max | 8 max | Unlimited | Unlimited |
| Async duel grading | Metadata only | Lite (whisper-small) | Full (Qwen) | Full (Whisper Elite) |
| Live coaching/day | 1 lite; rest metadata | ~15/mo cap, then metadata | Unlimited full | Unlimited Elite |
| ASR engine | whisper-small CPU | whisper-small CPU | Qwen3-ASR-0.6B + ForcedAligner | Whisper large-v3-turbo |
| Worker queue | Standard (<120s) | Standard (<120s) | Priority Qwen (<30s) | Priority Elite (<30s) |
| Phoneme analysis | None | None | Flagged + 5 manual/mo | Unlimited on-demand (P-04) |
| Analytics dashboard | None | Basic stats | WPM trends | Full dashboard (P-08) |
| Ads | Yes | No | No | No |
| Ranked play | Unlimited | Unlimited | Unlimited | Unlimited |

### Payment Infrastructure
- **Provider:** Stripe Subscriptions
- **Mobile:** Apple In-App Purchase (iOS) + Google Play Billing (Android)
- **Web (if applicable):** Stripe Checkout
- **Webhook-driven:** Stripe/Apple/Google webhooks update subscription status; no polling

### Data Models

```sql
-- subscriptions
CREATE TABLE subscriptions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID REFERENCES users(id) UNIQUE,
    provider             TEXT NOT NULL,       -- 'stripe' | 'apple' | 'google'
    provider_sub_id      TEXT NOT NULL,
    plan_tier            TEXT NOT NULL DEFAULT 'plus',
                                              -- 'plus' | 'pro' | 'elite'
    status               TEXT NOT NULL,       -- 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired'
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- subscription_events (webhook audit log)
CREATE TABLE subscription_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    provider        TEXT NOT NULL,
    event_type      TEXT NOT NULL,   -- 'created' | 'renewed' | 'upgraded' | 'downgraded' | 'cancelled' | 'payment_failed'
    plan_tier       TEXT,
    payload         JSONB,
    processed_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/subscriptions/me` | Bearer | Current subscription status and plan tier |
| POST | `/subscriptions/checkout` | Bearer | Create Stripe Checkout session (web) |
| POST | `/subscriptions/cancel` | Bearer | Schedule cancellation at period end |
| POST | `/webhooks/stripe` | Stripe signature | Handle Stripe subscription events |
| POST | `/webhooks/apple` | Apple signature | Handle Apple subscription events |
| POST | `/webhooks/google` | Google signature | Handle Google subscription events |

### Entitlement Checks

```python
def subscription_tier(user_id: str) -> str:
    """Returns 'free' | 'plus' | 'pro' | 'elite'. Reads from Redis cache first."""
    cached = redis.get(f"sub_tier:{user_id}")
    if cached is not None:
        return cached.decode()
    sub = db.get_subscription(user_id)
    if sub and sub.status in ("active", "trialing") and sub.current_period_end > datetime.utcnow():
        tier = sub.plan_tier
    else:
        tier = "free"
    redis.setex(f"sub_tier:{user_id}", 300, tier)
    return tier


def is_paid(user_id: str) -> bool:
    """True for any paid tier (plus, pro, or elite)."""
    return subscription_tier(user_id) in ("plus", "pro", "elite")


def has_priority_queue(user_id: str) -> bool:
    """True for Pro and Elite — routes to GPU priority queues."""
    return subscription_tier(user_id) in ("pro", "elite")
```

Redis cache TTL = 5 minutes. Webhook receipt immediately invalidates the cache for the affected user.

### Free Tier Cap Enforcement (Backend)

Caps are enforced server-side via `resolve_pipeline_tier()` (see [[tdd_spec_computeEconomics.md]]). The client cannot override them.

- **Async duel cap (free):** `COUNT(active_duels WHERE user_id AND status='active') >= 3` → 403
- **Async duel cap (plus):** Same check but threshold = 8
- **Live coaching cap (free):** 1 lite job/user/day via `daily_lite_cap_reached()`
- **Live coaching cap (plus):** ~15 full jobs/month via `monthly_coaching_cap_reached()`
- Pro/Elite: no caps; all checks short-circuit on `subscription_tier() in ('pro', 'elite')`

---

## 2. TDD Requirements

### Unit Tests

```python
# test_subscription_tiers_unit.py
def test_subscription_tier_returns_correct_tier_for_active_plus():
def test_subscription_tier_returns_correct_tier_for_active_pro():
def test_subscription_tier_returns_correct_tier_for_active_elite():
def test_subscription_tier_returns_free_for_cancelled():
def test_subscription_tier_returns_free_for_expired():
def test_subscription_tier_returns_free_for_no_subscription():
def test_subscription_tier_reads_from_redis_cache_first():
def test_subscription_tier_falls_back_to_db_on_cache_miss():
def test_webhook_invalidates_redis_cache_on_receipt():
def test_stripe_webhook_signature_validation():
def test_apple_webhook_signature_validation():
def test_async_duel_cap_3_enforced_for_free_user():
def test_async_duel_cap_8_enforced_for_plus_user():
def test_async_duel_cap_bypassed_for_pro_user():
def test_async_duel_cap_bypassed_for_elite_user():
def test_free_async_duel_resolves_to_metadata_only():
def test_plus_async_duel_resolves_to_lite():
def test_pro_async_duel_resolves_to_full():
def test_elite_async_duel_resolves_to_elite():
def test_has_priority_queue_false_for_free_and_plus():
def test_has_priority_queue_true_for_pro_and_elite():
```

### Integration Tests

```python
# test_subscription_tiers_integration.py
def test_stripe_webhook_creates_plus_subscription():
def test_stripe_webhook_creates_pro_subscription():
def test_stripe_webhook_creates_elite_subscription():
def test_stripe_webhook_updates_plan_tier_on_upgrade():
def test_stripe_webhook_cancels_subscription_on_payment_fail():
def test_apple_webhook_creates_subscription_record():
def test_google_webhook_creates_subscription_record():
def test_subscription_event_logged_for_every_webhook():
def test_free_tier_user_gets_403_on_fourth_async_duel():
def test_plus_tier_user_gets_403_on_ninth_async_duel():
def test_pro_tier_user_succeeds_on_ninth_async_duel():
def test_pro_user_async_duel_runs_full_pipeline():
def test_elite_user_async_duel_runs_elite_pipeline():
def test_subscription_status_endpoint_returns_correct_tier():
def test_cancel_sets_cancel_at_period_end_true():
def test_cancelled_subscription_remains_active_until_period_end():
```

### E2E Tests

```
Scenario: User subscribes to Pro and immediately gains Pro access
  Given a free-tier user
  When they purchase the Pro subscription ($15.99)
  And the webhook is received
  Then their subscription status shows plan_tier='pro', status='active'
  And they can immediately queue more than 3 async duels
  And their next live match triggers the full (Qwen) pipeline
  And their next async duel triggers the full (Qwen) pipeline

Scenario: Elite user gets Whisper turbo pipeline
  Given an Elite subscriber
  When their live match concludes and audio uploads
  Then their processing job uses the elite tier (whisper-large-v3-turbo)
  And they can request on-demand phoneme analysis

Scenario: Subscription expires, access reverts to free tier
  Given a Pro user whose subscription has lapsed
  When the current period ends without renewal
  And the webhook updates status to 'expired'
  Then their next async duel attempt after 3 returns 403
  And async duels revert to metadata-only grading
  And the result screen shows an upgrade prompt
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Monetization gates **depth of insight**, not core gameplay. Free users get one lite coaching review per day plus unlimited ranked play. Plus at $9.99 removes ads and adds lite async coaching. Pro at $15.99 unlocks unlimited Qwen-powered full analysis and priority processing. Elite at $19.99 upgrades to Whisper large-v3-turbo and unlimited phoneme analysis — for players who want the deepest possible feedback loop.

---

## 4. Bidirectional Links

- [features.md → P-07](../features.md)
- Related specs: [[tdd_spec_computeEconomics.md]] (pricing/tiers), [[tdd_spec_postMatchPipeline.md]] (free vs paid gate), [[tdd_spec_asyncAudioDuels.md]] (duel cap + grading tier), [[tdd_spec_phonemeAnalysis.md]] (Elite on-demand), [[tdd_spec_linguisticAnalytics.md]] (Pro+Elite), [[tdd_spec_priorityQueue.md]] (Pro+Elite queue)
