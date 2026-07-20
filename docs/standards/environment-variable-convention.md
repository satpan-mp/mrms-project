# Environment Variable Convention

Configuration and secrets management rules. The canonical template is
`.env.example`; operational detail is in `docs/CONFIGURATION.md` and
`docs/SECRETS.md`.

## 1. Naming

- `UPPER_SNAKE_CASE`, grouped by a domain prefix:

| Prefix | Domain |
|--------|--------|
| `APP_` | App-level (env, port, base URL, timezone) |
| `DATABASE_` | PostgreSQL connection |
| `REDIS_` | Redis connection |
| `JWT_` | Token signing/expiry |
| `GOOGLE_` | OAuth + Calendar integration |
| `SYNC_` | Calendar sync tuning |
| `DEVICE_` | Device/kiosk auth & monitoring |
| `VITE_` | Frontend build-time public config (Vite requires this prefix) |

## 2. Rules

- **Never commit real secrets.** `.env` is git-ignored; only `.env.example`
  (with placeholder values) is committed.
- Every variable used in code must exist in `.env.example` with a safe placeholder
  and a comment describing it.
- Validate and type env at startup (e.g., a config schema with Zod/`class-validator`).
  Fail fast on missing/invalid required variables.
- Access config through a central config module - never read `process.env`
  scattered across the codebase.
- **Frontend:** only `VITE_`-prefixed, non-secret values are exposed to the client
  bundle. Never put secrets in `VITE_*`.
- Provide sensible non-secret defaults where safe (e.g., `APP_PORT=3000`); require
  explicit values for anything security-relevant.
- Document any new variable in `.env.example` + `docs/CONFIGURATION.md` in the same
  change (docs-first).

## 3. Categories

| Category | Examples | Committed? |
|----------|----------|-----------|
| Non-secret config | `APP_PORT`, `APP_TIMEZONE`, `SYNC_INTERVAL_SECONDS` | Placeholder in `.env.example` |
| Secrets | `DATABASE_URL` password, `JWT_PRIVATE_KEY`, `GOOGLE_CLIENT_SECRET` | Never; injected via secret store |
| Public FE config | `VITE_API_BASE_URL`, `VITE_WS_URL` | Placeholder only |

## 4. Environments

- Separate values per environment (local/dev, staging, prod) supplied by the
  deployment platform or an on-prem secret store - not by committing multiple
  `.env` files.
- Local development copies `.env.example` to `.env` (via `scripts/setup.*`).
- Rotate secrets periodically; device tokens are revocable and rotated (see
  `docs/12-Authentication-Flow.md`).
