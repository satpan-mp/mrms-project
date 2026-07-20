# Configuration Guide

How MRMS is configured across environments. The canonical variable list is
`.env.example`; the rules are in
`docs/standards/environment-variable-convention.md`. Secret handling is in
`docs/SECRETS.md`.

---

## 1. Configuration Sources (precedence)

1. **Environment variables** (`.env` locally; secret store / orchestrator in
   staging/prod) - connection strings, secrets, ports, base URLs.
2. **Database `Setting` table** - runtime-tunable behavior an admin can change
   without redeploy (status windows, sync interval, feature toggles). Cached in
   Redis and hot-reloadable.

Environment provides *bootstrap* defaults; the `Setting` table is authoritative
for the tunables it owns once seeded.

---

## 2. Variable Reference

### App
| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | Environment: development / staging / production |
| `APP_PORT` | `3000` | Backend API/gateway port |
| `APP_BASE_URL` | `http://localhost:3000` | Public API base URL |
| `APP_TIMEZONE` | `Asia/Makassar` | Default display timezone (per-site override in DB) |
| `APP_LOG_LEVEL` | `info` | Log verbosity |
| `WEB_HTTP_PORT` | `8080` | Host port for the web (nginx) container |

### Database / Redis
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma PostgreSQL connection string (**secret** - contains password) |
| `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` / `DATABASE_HOST` / `DATABASE_PORT` | Parts used by compose to compose the URL |
| `REDIS_URL` | Redis connection string |
| `REDIS_HOST` / `REDIS_PORT` | Redis host/port parts |

### Auth (JWT)
| Variable | Description |
|----------|-------------|
| `JWT_PRIVATE_KEY` | **Secret** RS256 signing key (PEM) |
| `JWT_PUBLIC_KEY` | Verification key (PEM) |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Token lifetimes (default 15m / 7d) |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Token issuer/audience claims |

### Google
| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth client id |
| `GOOGLE_CLIENT_SECRET` | **Secret** OAuth client secret |
| `GOOGLE_OAUTH_REDIRECT_URI` | OAuth callback URL |
| `GOOGLE_ALLOWED_DOMAINS` | Comma-separated allowed Workspace login domains |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | **Secret** path to service-account JSON (calendar read + event create) |
| `GOOGLE_DELEGATED_USER` | Optional delegated user for domain-wide delegation |
| `GOOGLE_CALENDAR_SCOPES` | Least-privilege scopes: `calendar.readonly` + `calendar.events` (no edit/delete scope) |

### Sync
| Variable | Default | Description |
|----------|---------|-------------|
| `SYNC_INTERVAL_SECONDS` | `60` | Poll cadence (baseline/fallback) |
| `SYNC_WINDOW_DAYS` | `14` | Days ahead to cache |
| `SYNC_USE_WATCH_CHANNELS` | `true` | Use Google push notifications |
| `SYNC_WATCH_RENEW_LEAD_MINUTES` | `60` | Renew watch channels before expiry |

### Meeting Timing (env defaults; also seeded to `Setting`)
| Variable | Default | Description |
|----------|---------|-------------|
| `STARTING_SOON_LEAD_MINUTES` | `10` | "Starting Soon" lead window |
| `NO_SHOW_GRACE_MINUTES` | `15` | No-show auto-release grace |
| `JOIN_AUTO_CLOSE_GRACE_MINUTES` | `5` | Grace after end before returning to display |

### Device / Kiosk
| Variable | Default | Description |
|----------|---------|-------------|
| `DEVICE_HEARTBEAT_INTERVAL_SECONDS` | `30` | Heartbeat cadence |
| `DEVICE_OFFLINE_THRESHOLD_SECONDS` | `120` | Missed-heartbeat window before OFFLINE |
| `DEVICE_TOKEN_SALT` | - | **Secret** salt for hashing device tokens |

### Feature Toggles / Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_ZOOM` | `true` | Enable Zoom join integration |
| `VITE_API_BASE_URL` | - | **Public** API base for SPAs (build-time) |
| `VITE_WS_URL` | - | **Public** WebSocket URL for SPAs (build-time) |

> Only `VITE_`-prefixed, non-secret values are exposed to the client bundle.

---

## 3. Environment-Specific Configuration

| Environment | Source of values |
|-------------|------------------|
| Local / dev | `.env` created from `.env.example` via `scripts/setup.*` |
| Staging | Orchestrator env + secret store (no committed `.env`) |
| Production (on-prem) | Host secret store / Docker secrets; `docker-compose.prod.yml` overrides |

Runtime `Setting` values (timing windows, sync interval, toggles) are managed by
admins through the Admin Panel once implemented.

---

## 4. Validation

The backend validates configuration at startup against a schema and **fails fast**
on missing/invalid required variables (implemented in Sprint 1). This prevents
running with a misconfigured or insecure setup.

---

## 5. Adding a New Variable (checklist)

1. Add it to `.env.example` with a safe placeholder + comment.
2. Document it in this file's reference table.
3. Add it to the startup config schema with validation + default (if non-secret).
4. If it is a secret, follow `docs/SECRETS.md` (never commit a real value).
5. Update any affected `docker-compose.*.yml` / deployment manifests.
