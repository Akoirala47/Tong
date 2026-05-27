# TDD Spec: User Authentication & Profile (M-01)

> Back to [features.md](../features.md) | See [narrative.md](../narrative.md) for North Star

---

## 1. Technical Specification

### Overview
Account lifecycle management: registration, login, session management, OAuth (Google/Apple), and the public profile page that surfaces rank, XP, and match history.

### Data Models

```sql
-- users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    username        TEXT UNIQUE NOT NULL,
    display_name    TEXT,
    avatar_url      TEXT,
    target_language TEXT NOT NULL,           -- e.g. 'es', 'ja', 'fr'
    native_language TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- profiles (extended game stats, 1:1 with users)
CREATE TABLE profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    elo             INTEGER NOT NULL DEFAULT 1000,
    mmr             INTEGER NOT NULL DEFAULT 1000,    -- hidden matchmaking rating
    rank_tier       TEXT NOT NULL DEFAULT 'Bronze',   -- Bronze/Silver/Gold/Platinum/Diamond/Master
    xp_total        INTEGER NOT NULL DEFAULT 0,
    streak_days     INTEGER NOT NULL DEFAULT 0,
    last_active_at  TIMESTAMPTZ DEFAULT NOW()
);

-- oauth_providers (for Google/Apple sign-in)
CREATE TABLE oauth_providers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL,       -- 'google' | 'apple'
    provider_uid    TEXT NOT NULL,
    UNIQUE(provider, provider_uid)
);
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Email + password registration |
| POST | `/auth/login` | None | Returns JWT access + refresh token |
| POST | `/auth/refresh` | Refresh token | Rotate access token |
| POST | `/auth/logout` | Bearer | Invalidate refresh token |
| POST | `/auth/oauth/{provider}` | None | OAuth redirect initiation |
| GET | `/auth/oauth/{provider}/callback` | None | OAuth callback, returns tokens |
| GET | `/users/me` | Bearer | Fetch own profile |
| PATCH | `/users/me` | Bearer | Update display_name, avatar_url |
| GET | `/users/{username}` | None | Public profile (ELO, rank, stats) |

### Auth Architecture
- Access token: JWT, 15-minute expiry, signed with RS256
- Refresh token: opaque UUID stored in Redis (`refresh:<token> → user_id`), 30-day TTL
- Supabase Auth handles OAuth flow; FastAPI validates Supabase-issued JWTs via JWKS endpoint
- Passwords hashed with `bcrypt` (cost factor 12)

---

## 2. TDD Requirements

### Unit Tests

```python
# test_auth_unit.py
def test_password_hash_is_not_plaintext():
def test_password_verification_correct_password_returns_true():
def test_password_verification_wrong_password_returns_false():
def test_jwt_access_token_contains_user_id_and_expiry():
def test_jwt_access_token_expires_in_15_minutes():
def test_jwt_with_tampered_signature_raises_error():
def test_username_validation_rejects_spaces():
def test_username_validation_rejects_special_chars():
def test_rank_tier_computed_correctly_from_elo():
    # 0-999=Bronze, 1000-1199=Silver, 1200-1499=Gold, etc.
```

### Integration Tests

```python
# test_auth_integration.py
def test_register_creates_user_and_profile_in_db():
def test_register_duplicate_email_returns_409():
def test_register_duplicate_username_returns_409():
def test_login_valid_credentials_returns_access_and_refresh_tokens():
def test_login_invalid_password_returns_401():
def test_login_nonexistent_user_returns_401():
def test_refresh_token_rotates_and_invalidates_old_token():
def test_logout_invalidates_refresh_token_in_redis():
def test_get_own_profile_returns_correct_data():
def test_get_public_profile_does_not_expose_email():
def test_patch_profile_updates_display_name():
def test_expired_access_token_returns_401():
```

### E2E Tests

```
Scenario: New user registration and first login
  Given a new email address not in the system
  When the user submits registration form with valid data
  Then their profile page is visible with Bronze rank
  And their XP shows 0

Scenario: OAuth login with Google
  Given a valid Google account
  When the user taps "Continue with Google"
  Then they are redirected to Google consent screen
  And returned to the app as an authenticated session

Scenario: Token refresh on expiry
  Given an active session with an access token about to expire
  When the client makes an authenticated API call
  Then the SDK transparently refreshes the token
  And the API call succeeds without re-login
```

---

## 3. Narrative Alignment

The North Star is: **"Force players to speak before they feel ready."**

Authentication is the front door. A frictionless sign-up (including Apple/Google OAuth, which is mandatory for App Store users) directly increases the conversion rate from download → first match. Every unnecessary step in account creation is a player lost before they ever hear the pressure of a live ranked battle.

The public profile (visible ELO, rank badge, win history) is not cosmetic. It is the **reputational stake** that makes every ranked match matter. Without a persistent, visible identity tied to a rank, there is nothing to protect — and therefore no real pressure to perform.

---

## 4. Bidirectional Links

- [features.md → M-01](../features.md)
- Related specs: [[tdd_spec_eloMatchmaking.md]] (rank display), [[tdd_spec_gamification.md]] (XP + streak on profile)
