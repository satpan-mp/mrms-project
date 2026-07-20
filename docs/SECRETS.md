# Secrets Management

Rules and practices for handling sensitive values in MRMS. This complements
`docs/CONFIGURATION.md` and `docs/standards/environment-variable-convention.md`,
and aligns with the security NFRs (NFR-SEC-4/5/9).

---

## 1. Golden Rules

1. **Never commit secrets.** No real credentials in the repository, ever -
   including in code, config, tests, docs, or commit history.
2. `.env` is git-ignored; only `.env.example` with **placeholder** values is
   committed.
3. Secrets are injected at runtime from a **secret store** (or Docker/host
   secrets), not baked into images.
4. **Never log secrets** (see `docs/standards/logging-convention.md`). Reference
   them by name, not value.
5. Frontend bundles must never contain secrets (only `VITE_*` public config).

---

## 2. Inventory of Secrets

| Secret | Variable / Location | Notes |
|--------|---------------------|-------|
| Database password | `DATABASE_PASSWORD` / inside `DATABASE_URL` | Rotate; strong random value in prod |
| JWT signing key | `JWT_PRIVATE_KEY` (PEM) | RS256 private key; public key verifies |
| Google OAuth client secret | `GOOGLE_CLIENT_SECRET` | From Google Cloud console |
| Google service account key | `GOOGLE_SERVICE_ACCOUNT_JSON` (file) | Mounted file, not committed |
| Device token salt | `DEVICE_TOKEN_SALT` | Used to hash room device tokens |
| Google API tokens (runtime) | Stored **encrypted at rest** in DB | Never plaintext (NFR-SEC-5) |
| Device tokens (runtime) | Stored **hashed** in DB (`Device.agentTokenHash`) | Room-scoped, revocable |

---

## 3. Storage & Injection

| Environment | Mechanism |
|-------------|-----------|
| Local dev | `.env` file (git-ignored), created from `.env.example` |
| Staging / Prod (on-prem) | Docker secrets / host secret store / orchestrator env; mounted files for JSON keys (e.g., `/run/secrets/gcal-sa.json`) |

- The service-account JSON is provided as a **mounted file path**
  (`GOOGLE_SERVICE_ACCOUNT_JSON`), never inlined or committed. `.gitignore`
  already excludes `service-account*.json`, `credentials.json`, `*.pem`, `*.key`.
- At-rest encryption: Google refresh/access tokens persisted by the app are
  encrypted using a key from the secret store.

---

## 4. Rotation

- Rotate database, JWT, and Google client secrets on a defined schedule and
  immediately upon suspected compromise.
- **JWT keys:** support key rotation (issue with new key, verify against current
  + previous during overlap).
- **Device tokens:** room-scoped and revocable; rotate periodically
  (`deviceTokenRotationDays`, default 90 - see `docs/12-Authentication-Flow.md`).
  Revoking one room's token does not affect others.

---

## 5. Least Privilege

- Google scopes are limited to `calendar.readonly` + `calendar.events` (create).
  No edit/delete scope is ever requested (enforces the no-edit/no-delete rule at
  the permission level).
- Database users for the app have only the privileges they need.
- Secret store access is limited to the services that require each secret.

---

## 6. Incident Response (secret leak)

1. **Revoke/rotate** the exposed secret immediately at the source (Google
   console, DB, key store).
2. Invalidate affected sessions/tokens.
3. If a secret was committed, rotate it - **do not** rely on deleting the commit;
   treat the value as permanently compromised. Purge history only as a secondary
   measure.
4. Record the incident and review how it happened.

---

## 7. Tooling

- Enable **GitHub secret scanning + push protection** (see
  `.github/BRANCH_PROTECTION.md`) to block accidental commits of known secret
  formats.
- Pre-commit secret scanning (e.g., gitleaks) is recommended and can be added in
  Sprint 1.
- `.gitignore` and `.dockerignore` exclude common secret files from VCS and image
  build context.
