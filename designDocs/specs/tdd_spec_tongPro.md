# TDD Spec: Tong Pro Monetization (P-07)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star
> **Post-MVP** — assumes all M-01 through M-10 tasks are complete.

---

## 1. Technical Specification

### Overview
A flat monthly subscription that removes all free-tier compute caps and unlocks premium features. The free tier is architectured to deliver genuine core value while making the computational cost of unlimited depth analysis the clear value proposition for Pro.

### Tier Comparison

| Feature | Free | Tong Pro |
|---------|------|----------|
| Micro-lessons | Unlimited | Unlimited |
| Flashcards | Unlimited text | Unlimited text + audio |
| Boss Battles | Unlimited | Unlimited |
| Async Duels | 3 active duels/day | Unlimited |
| Live Ranked (VOD Review) | 1 full analysis/day | Every match |
| Post-match feedback | First match only | All matches |
| Phoneme analysis | None | All matches |
| Worker queue priority | Standard | Priority lane |
| Linguistic analytics dashboard | None | Full access |
| Formant trend charts | None | Full access |

### Payment Infrastructure
- **Provider:** Stripe Subscriptions
- **Mobile:** Apple In-App Purchase (iOS) + Google Play Billing (Android) — required by app stores for in-app purchases
- **Web (if applicable):** Stripe Checkout
- **Webhook-driven:** Stripe/Apple/Google webhooks update subscription status; no polling

### Data Models

```sql
-- subscriptions
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) UNIQUE,
    provider            TEXT NOT NULL,       -- 'stripe' | 'apple' | 'google'
    provider_sub_id     TEXT NOT NULL,       -- Stripe subscription ID or Apple/Google receipt
    status              TEXT NOT NULL,       -- 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired'
    current_period_end  TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- subscription_events (webhook audit log)
CREATE TABLE subscription_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    provider        TEXT NOT NULL,
    event_type      TEXT NOT NULL,       -- 'created' | 'renewed' | 'cancelled' | 'payment_failed'
    payload         JSONB,
    processed_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/subscriptions/me` | Bearer | Current subscription status and tier |
| POST | `/subscriptions/checkout` | Bearer | Create Stripe Checkout session (web) |
| POST | `/subscriptions/cancel` | Bearer | Schedule cancellation at period end |
| POST | `/webhooks/stripe` | Stripe signature | Handle Stripe subscription events |
| POST | `/webhooks/apple` | Apple signature | Handle Apple subscription events |
| POST | `/webhooks/google` | Google signature | Handle Google subscription events |

### Entitlement Checks

```python
def is_pro(user_id: str) -> bool:
    """Fast entitlement check — reads from Redis cache first, falls back to DB."""
    cached = redis.get(f"pro:{user_id}")
    if cached is not None:
        return cached == "1"
    sub = db.get_subscription(user_id)
    is_active = sub and sub.status in ("active", "trialing") and sub.current_period_end > datetime.utcnow()
    redis.setex(f"pro:{user_id}", 300, "1" if is_active else "0")
    return is_active
```

Redis cache TTL = 5 minutes. Webhook receipt immediately invalidates the cache for the affected user.

### Free Tier Cap Enforcement (Backend)
Caps are enforced server-side. The client cannot override them.
- Async duel cap: check `COUNT(active_duels WHERE user_id AND status='active') >= 3`
- Full analysis cap: check `COUNT(processing_jobs WHERE user_id AND DATE(created_at)=TODAY AND type='full') >= 1`
- These checks call `is_pro()` first; if True, skip cap.

---

## 2. TDD Requirements

### Unit Tests

```python
# test_tong_pro_unit.py
def test_is_pro_returns_true_for_active_subscription():
def test_is_pro_returns_false_for_cancelled_subscription():
def test_is_pro_returns_false_for_expired_subscription():
def test_is_pro_returns_false_for_no_subscription():
def test_is_pro_reads_from_redis_cache_first():
def test_is_pro_falls_back_to_db_on_cache_miss():
def test_webhook_invalidates_redis_cache_on_receipt():
def test_stripe_webhook_signature_validation():
def test_apple_webhook_signature_validation():
def test_async_duel_cap_enforced_for_free_user():
def test_async_duel_cap_bypassed_for_pro_user():
def test_full_analysis_cap_enforced_for_free_user():
def test_full_analysis_cap_bypassed_for_pro_user():
```

### Integration Tests

```python
# test_tong_pro_integration.py
def test_stripe_webhook_creates_subscription_record():
def test_stripe_webhook_updates_subscription_on_renewal():
def test_stripe_webhook_cancels_subscription_on_payment_fail():
def test_apple_webhook_creates_subscription_record():
def test_google_webhook_creates_subscription_record():
def test_subscription_event_logged_for_every_webhook():
def test_free_tier_user_gets_403_on_fourth_async_duel():
def test_pro_tier_user_succeeds_on_fourth_async_duel():
def test_subscription_status_endpoint_returns_correct_data():
def test_cancel_sets_cancel_at_period_end_true():
def test_cancelled_subscription_remains_active_until_period_end():
```

### E2E Tests

```
Scenario: User subscribes and immediately gains Pro access
  Given a free-tier user
  When they complete an in-app purchase (Stripe/Apple/Google)
  And the webhook is received
  Then their subscription status shows 'active'
  And they can immediately queue for more than 3 async duels
  And their next match triggers the full analysis pipeline

Scenario: Subscription expires, access reverts to free tier
  Given a Pro user whose subscription has lapsed
  When the current period ends without renewal
  And the webhook updates status to 'expired'
  Then their next async duel attempt after 3 returns 403
  And the result screen shows a "Upgrade to Pro" prompt
```

---

## 3. Narrative Alignment

The North Star: **"Force players to speak before they feel ready."**

Monetization in Tong is designed around a single principle: **the free tier must feel valuable, and the Pro tier must feel necessary**. A player who does one full-analysis match per day gets real value — detailed feedback, phoneme-level coaching, ELO updates. But after their first match, the gap between what they *could* get (unlimited analysis, priority queue, formant trends) and what they *do* get becomes tangible. The Pro tier is not a paywall on core gameplay — it is a paywall on the depth of insight. This structure ensures free users are genuinely engaged (they play, they speak) while creating organic upgrade intent from the players most committed to improvement.

---

## 4. Bidirectional Links

- [features.md → P-07](../features.md)
- Related specs: [[tdd_spec_postMatchPipeline.md]] (free vs pro gate), [[tdd_spec_asyncAudioDuels.md]] (duel cap), [[tdd_spec_phonemeAnalysis.md]] (Pro-only), [[tdd_spec_linguisticAnalytics.md]] (Pro-only), [[tdd_spec_priorityQueue.md]] (Pro-only)
