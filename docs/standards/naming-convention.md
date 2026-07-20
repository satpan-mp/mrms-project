# Naming Convention

Consistent names across code, files, database, and APIs.

## 1. Files & Directories

| Kind | Convention | Example |
|------|-----------|---------|
| Directories | `kebab-case` | `check-in/`, `google-calendar/` |
| TS source (non-component) | `kebab-case.ts` | `room-status.service.ts` |
| NestJS files | `<name>.<role>.ts` | `booking.controller.ts`, `create-booking.use-case.ts` |
| React components | `PascalCase.tsx` | `RoomDisplayScreen.tsx`, `StatusPill.tsx` |
| React hooks | `useX.ts` (camelCase) | `useRoomStatus.ts` |
| Tests | `<name>.spec.ts` | `room-status.service.spec.ts` |
| Barrel files | `index.ts` | `index.ts` |

## 2. Code Symbols

| Kind | Convention | Example |
|------|-----------|---------|
| Classes / Interfaces / Types / Enums | `PascalCase` | `Booking`, `RoomStatus`, `CalendarGatewayPort` |
| Interface names | `PascalCase` (no `I` prefix) | `BookingRepository` (not `IBookingRepository`) |
| Variables / functions / methods | `camelCase` | `computeStatus`, `graceDeadline` |
| Constants (compile-time) | `UPPER_SNAKE_CASE` | `DEFAULT_GRACE_MINUTES` |
| Enum members | `UPPER_SNAKE_CASE` | `RoomStatus.STARTING_SOON` |
| React components | `PascalCase` | `BookingModal` |
| Boolean names | `is/has/can/should` prefix | `isCheckedIn`, `hasMeetLink` |
| DI tokens | `PascalCase` + `Port`/`Token` suffix | `BookingRepositoryPort` |

## 3. Database (PostgreSQL via Prisma)

| Kind | Convention | Example |
|------|-----------|---------|
| Prisma model | `PascalCase` singular | `MeetingCache` |
| Table name (`@@map`) | `snake_case` plural | `meeting_cache`, `check_ins` |
| Column (`@map`) | `snake_case` | `google_resource_id` |
| Enum type | `PascalCase` | `RoomStatus` |
| Foreign keys | `<entity>_id` | `room_id`, `site_id` |
| Indexes | implicit or `idx_<table>_<cols>` | `idx_meeting_cache_room_start` |

## 4. API

| Kind | Convention | Example |
|------|-----------|---------|
| REST paths | `kebab-case`, plural nouns | `/api/v1/rooms/{id}/schedule` |
| Query params | `camelCase` | `?siteId=...&pageSize=25` |
| JSON fields | `camelCase` | `googleEventId`, `startTime` |
| WebSocket events | `dot.case` | `room.status`, `meeting.started` |
| WS channels | `type:{id}` | `room:{roomId}`, `site:{siteId}` |
| Error codes | `UPPER_SNAKE_CASE` | `ROOM_NOT_AVAILABLE` |

## 5. Environment Variables

- `UPPER_SNAKE_CASE`, grouped by prefix: `DATABASE_`, `REDIS_`, `GOOGLE_`,
  `JWT_`, `APP_`. See the environment-variable convention.

## 6. Branches & Commits

- Branches: `<type>/<issue-id>-<kebab-summary>` (see branch convention).
- Commits: Conventional Commits (see commit convention).

## 7. Packages

- Workspace packages scoped `@mrms/*`: `@mrms/ui`, `@mrms/api-client`,
  `@mrms/realtime`, `@mrms/hooks`, `@mrms/types`, `@mrms/config`.
