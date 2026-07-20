# Database Convention

Schema of record: `docs/08-Database-Schema.md` (Prisma) and `docs/07-Database-ERD.md`.
PostgreSQL accessed exclusively through **Prisma** behind repository ports.

## 1. Modeling

- Prisma models: `PascalCase` singular (`MeetingCache`); map to `snake_case`
  plural tables via `@@map` (`meeting_cache`).
- Columns map to `snake_case` via `@map` where the TS name differs.
- Primary keys: `id String @id @default(uuid())` (UUID v4) unless a strong reason
  exists otherwise.
- Foreign keys: `<entity>_id`; define explicit relations and `onDelete` behavior.
- Enums are Prisma enums (`RoomStatus`, `CheckInState`, ...), values
  `UPPER_SNAKE_CASE`.

## 2. Timestamps & Time

- Store all timestamps in **UTC** (`DateTime`).
- `createdAt @default(now())` and `updatedAt @updatedAt` on mutable entities.
- Presentation converts to `Site.timezone` (default `Asia/Makassar`); never store
  local time.

## 3. Integrity & Indexes

- Enforce uniqueness at the DB level: e.g., `Room.googleResourceId`,
  `User.email`, `MeetingCache(roomId, googleEventId)`, `Setting(key, scope)`.
- Add indexes for hot queries: `MeetingCache(roomId, startTime, endTime)`,
  `DeviceHeartbeat(deviceId, createdAt)`, `SystemLog(createdAt, logType)`.
- Prefer soft-deactivation (`active = false`) over destructive deletes for
  Rooms/Sites to preserve history.

## 4. Migrations

- Use **Prisma Migrate**. Never edit the database schema by hand.
- Migration names are descriptive `snake_case`: `add_check_in_grace_deadline`.
- One logical schema change per migration; commit the generated migration with
  the code that needs it.
- Migrations are forward-only in shared environments; never rewrite applied
  migrations. Roll forward with a new migration.
- Review generated SQL before committing (especially destructive operations).

## 5. Source of Truth Rules

- **Google Calendar is authoritative** for reservations; `MeetingCache` is a
  read projection. The app never edits/deletes calendar events.
- App-owned state (check-in, no-show, analytics, monitoring, logs, settings) is
  authoritative in PostgreSQL.
- `MeetingCache` upserts are idempotent, keyed by `(roomId, googleEventId)`.

## 6. Transactions & Consistency

- Wrap multi-write operations (booking record, check-in transitions, no-show
  release) in Prisma transactions.
- Analytics reads use pre-aggregated `AnalyticsDaily`; do not compute heavy
  aggregates on the request path.

## 7. Data Protection & Retention

- Store only meeting metadata required for display/analytics.
- Apply retention policies (heartbeats, past meeting detail, logs) via scheduled
  jobs; document any policy change.
- No secrets in the database in plaintext; encrypt Google tokens at rest, hash
  device tokens.

## 8. Seeding

- `apps/backend/prisma/seed.ts` seeds Sites (BB/GP/Jembrana), Facilities,
  Settings (grace/lead windows, sync interval), and a bootstrap admin.
- Seeds must be idempotent (safe to run repeatedly).
