# Firebase Realtime Database Structure

## Objective

Implement/adjust Firebase Realtime Database (RTDB) reads/writes so the site logs game sessions, computes rollups, powers HorsPass + leaderboards, and supports store/entitlements—for multiple games—using the schema below.

## Conventions

- **snake_case** keys
- **user_id** is the immutable identity everywhere
- **game_id** identifies which game (e.g., "horsplay", "alphadarts")
- Client generates **UUID v4** for session_id, purchase_id, etc. (idempotent writes)
- **Timestamps** are ISO-8601 UTC strings (e.g., "2025-08-30T18:15:00Z")

## Canonical RTDB Structure

### User Management
```
/users/{user_id}
  email, name, picture_url,
  primary_auth_method, created_at, last_login_at,
  subscription_type,                 # denormalized helper (FREE/ONE/PLUS/MAX)
  auth_methods_json                  # ["auth0|sub", "google-oauth2|sub"]

/usernames/{user_id}
  username, active: true

/usernames_index/{username}
  user_id, active                    # uniqueness + fast lookup

/username_history/{user_id}/{history_id}
  old_username, changed_at

/email_index/{encoded_email}
  user_id                            # fast email→user lookup

/oauth_index/{encoded_provider_PIPE_id}
  user_id                            # stable provider subject (useful when email missing/changed)
```

### Game Catalog & Sessions
```
/games/{game_id}
  key, name, status, modes[], created_at
  # e.g., key:"horsplay", modes:["ranked","freeplay"]

/game_sessions_by_user/{user_id}/{session_id}
  (see **Game session fields** below)

/game_sessions_by_game/{game_id}/{session_id}
  user_id, (same **Game session fields** below)   # mirror for global queries

/stats/{user_id}/{game_id}
  total_sessions, total_targets_popped,
  best_time_seconds, favorite_difficulty, favorite_modifier, updated_at

/stats_by_mode/{user_id}/{game_id}/{game_mode}    # OPTIONAL (per-mode rollups)
  total_sessions, total_targets_popped,
  best_time_seconds, updated_at
```

### HorsPass System
```
/horspass_seasons/{game_id}/{season_id}
  name, starts_at, ends_at

/horspass_tracks/{season_id}/{tier}
  xp_required, reward_json

/horspass_progress/{user_id}/{season_id}
  xp_total, last_claimed_tier, updated_at
```

### Store & Monetization
```
/store_items/{sku}
  type: subscription|horspass_premium|cosmetic|bundle,
  title, price_cents, active, game_id|null        # null = global item

/purchases/{user_id}/{purchase_id}
  sku, price_cents, provider_tx_id, created_at

/entitlements/{user_id}/{sku}
  granted_at, source: purchase|grant|reward, meta_json

/user_loadouts/{user_id}/{game_id}
  slots_json, updated_at                          # {"skin":"SKIN-NEON","dart":"DART-GLITTER"}
```

### Configuration & Leaderboards
```
/remote_config/{game_id}/{key}
  json_value, updated_at

/leaderboards/{season_id}/best_score/{user_id}
  best_score, best_time_seconds,
  username_cache,                                 # OPTIONAL convenience
  updated_at
```

## Game Session Fields

Use these exact names on both mirrors (game_sessions_by_user and game_sessions_by_game):

- **user_id** (required on the by_game mirror; optional/redundant on by_user)
- **game_id**
- **username_snapshot** (optional display-only; do not use as a join key)
- **game_mode**
- **game_difficulty**
- **game_modifier_speed**
- **game_modifier_power**
- **game_modifier_size**
- **game_modifier_background**
- **game_modifier_type** (your former "enemy", generic)
- **game_duration_seconds**
- **game_targets_popped**
- **game_score**
- **game_completed**
- **created_at**
- **settings_json** (free-form extras; e.g., { "spawn_rate": 1.25, "wind": "on" })

## Implementation Points

### A) On Login (Client)
- Upsert `/users/{user_id}` (last_login_at, backfill name/picture_url)
- Ensure `/usernames/{user_id}` exists; if not, create a generated handle
- Maintain `/usernames_index/{username}` = { user_id, active:true }
- Maintain `/email_index/{encoded_email}` and `/oauth_index/{provider_PIPE_sub}`

### B) On Game Start
- Create session stub with client-generated session_id under:
  - `/game_sessions_by_user/{user_id}/{session_id}`
  - `/game_sessions_by_game/{game_id}/{session_id}` (include user_id)
- Populate all game_ fields you know up front; set game_completed:false

### C) On Game Finish
- Finalize both session docs: game_targets_popped, game_duration_seconds, game_score, game_completed:true
- **Rollups:**
  - Tx update `/stats/{user_id}/{game_id}` (increment counts, min best_time)
  - Optional: Tx update `/stats_by_mode/{user_id}/{game_id}/{game_mode}`
- **HorsPass:**
  - Compute XP from this session; Tx update `/horspass_progress/{user_id}/{season_id}`
- **Leaderboard:**
  - Upsert `/leaderboards/{season_id}/best_score/{user_id}` with best_score = max(...) and best_time_seconds = min(...)
  - Optionally set/update username_cache from `/usernames/{user_id}.username`

### D) On Purchase Success (Server Webhook or Client-Confirmed)
- Write `/purchases/{user_id}/{purchase_id}` with tx id
- Write `/entitlements/{user_id}/{sku}`
- Recompute `/users/{user_id}.subscription_type` from entitlements (MAX > PLUS > ONE > FREE)

### E) On Username Change
- Append `/username_history/{user_id}/{history_id}`
- Update `/usernames/{user_id}` and `/usernames_index/{new_username}`
- (Optional) Refresh username_cache on top leaderboard rows lazily

## Example Data Structures

### Games Catalog
```json
/games/horsplay: {
  "key":"horsplay",
  "name":"Horsplay",
  "status":"active",
  "modes":["ranked","freeplay"],
  "created_at":"2025-08-01T00:00:00Z"
}
```

### Game Session (By User) — Finished
```json
/game_sessions_by_user/USER_abc123/GS_0257: {
  "user_id":"USER_abc123",
  "game_id":"horsplay",
  "username_snapshot":"Horsey-474887",
  "game_mode":"ranked",
  "game_difficulty":"Easy",
  "game_modifier_speed":1.0,
  "game_modifier_power":50,
  "game_modifier_size":1.0,
  "game_modifier_background":"Unknown",
  "game_modifier_type":"Hors",
  "game_duration_seconds":14,
  "game_targets_popped":50,
  "game_score":50,
  "game_completed":true,
  "created_at":"2025-08-28T09:18:10Z",
  "settings_json":{"spawn_rate":1.0}
}
```

### Game Session (By Game) — Mirrored
```json
/game_sessions_by_game/horsplay/GS_0257: {
  "user_id":"USER_abc123",
  "game_id":"horsplay",
  "username_snapshot":"Horsey-474887",
  "game_mode":"ranked",
  "game_difficulty":"Easy",
  "game_modifier_speed":1.0,
  "game_modifier_power":50,
  "game_modifier_size":1.0,
  "game_modifier_background":"Unknown",
  "game_modifier_type":"Hors",
  "game_duration_seconds":14,
  "game_targets_popped":50,
  "game_score":50,
  "game_completed":true,
  "created_at":"2025-08-28T09:18:10Z",
  "settings_json":{"spawn_rate":1.0}
}
```

### Stats Rollups
```json
/stats/USER_abc123/horsplay: {
  "total_sessions":2,
  "total_targets_popped":100,
  "best_time_seconds":13,
  "favorite_difficulty":"Easy",
  "favorite_modifier":"Normal",
  "updated_at":"2025-08-28T18:00:00Z"
}

/stats_by_mode/USER_abc123/horsplay/ranked: {
  "total_sessions":2,
  "total_targets_popped":100,
  "best_time_seconds":13,
  "updated_at":"2025-08-28T18:00:00Z"
}
```

### HorsPass
```json
/horspass_seasons/horsplay/HP-S1: {
  "name":"HorsPass S1",
  "starts_at":"2025-08-01T00:00:00Z",
  "ends_at":"2025-09-30T23:59:59Z"
}

/horspass_progress/USER_abc123/HP-S1: {
  "xp_total":120,
  "last_claimed_tier":1,
  "updated_at":"2025-08-28T18:00:00Z"
}
```

### Leaderboard Row
```json
/leaderboards/HP-S1/best_score/USER_abc123: {
  "best_score":50,
  "best_time_seconds":13,
  "username_cache":"Horsey-474887",
  "updated_at":"2025-08-28T18:00:00Z"
}
```

### Store & Entitlements
```json
/store_items/HP-PREMIUM-S1: {
  "type":"horspass_premium",
  "title":"HorsPass Premium – S1",
  "price_cents":399,
  "active":true,
  "game_id":"horsplay"
}

/entitlements/USER_abc123/HP-PREMIUM-S1: {
  "granted_at":"2025-08-28T10:00:02Z",
  "source":"purchase"
}

/user_loadouts/USER_abc123/horsplay: {
  "slots_json":{"skin":"SKIN-NEON-HORSE","title":"TITLE-FASTEST"},
  "updated_at":"2025-08-29T13:15:00Z"
}
```

### Identity Indices
```json
/email_index/davebwashburn_AT_gmail_DOT_com: { 
  "user_id":"USER_abc123" 
}

/oauth_index/google-oauth2_PIPE_108787370291016599724: { 
  "user_id":"USER_abc123" 
}
```

## Important Notes

- **Authoritative identity** for all data = user_id
- **username_snapshot/username_cache** are display helpers only
- Keep both session mirrors in sync (by_user & by_game) for fast profile views and global leaderboards
- Per-mode stats are optional; if you keep them, write both game-level and mode-level rollups on finish
- **settings_json** is your safe sandbox for experimental flags so schema changes aren't needed

## Development Notes

- **Fresh Database:** This structure is designed for a clean implementation - no migration needed
- **Pre-Launch:** Implement all logging according to this schema during development
- **Launch Ready:** Database will be wiped clean before going live with proper structure in place
