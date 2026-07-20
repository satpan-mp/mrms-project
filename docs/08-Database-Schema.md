# Database Schema (Prisma / PostgreSQL)

**Project:** Meeting Room Management System (MRMS)
**Document:** 08 of 19 — Database Schema
**Status:** Draft for Approval
**Version:** 1.0
**Date:** 2026-07-20

---

## 1. Purpose

Concrete PostgreSQL schema expressed as a **Prisma schema** (the project ORM).
This is a design artifact for approval; it will become `prisma/schema.prisma`
during implementation. It maps 1:1 to the ERD (Document 07).

---

## 2. Prisma Schema

```prisma
// datasource & generator ---------------------------------------------------
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// enums --------------------------------------------------------------------
enum RoomStatus {
  AVAILABLE
  OCCUPIED
  STARTING_SOON
  MAINTENANCE
  RESERVED
}

enum UserRole {
  ADMINISTRATOR
  EMPLOYEE
}

enum MeetingSource {
  GOOGLE_CALENDAR
  APP_BOOKING
}

enum ResponseStatus {
  ACCEPTED
  DECLINED
  TENTATIVE
  NEEDS_ACTION
}

enum BookingStatus {
  CREATED
  SYNCED
  FAILED
  CANCELLED_EXTERNALLY
}

enum CheckInState {
  PENDING
  CHECKED_IN
  NO_SHOW
  RELEASED
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  DEGRADED
  UNKNOWN
}

enum AnnouncementScope {
  GLOBAL
  SITE
  ROOM
}

enum LogType {
  SYSTEM
  ACTIVITY
  AUDIT
}

enum SyncStatus {
  SUCCESS
  PARTIAL
  FAILED
}

// core catalog -------------------------------------------------------------
model Site {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  timezone  String   @default("Asia/Makassar")
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  rooms         Room[]
  announcements AnnouncementTarget[]

  @@map("sites")
}

model Room {
  id               String     @id @default(uuid())
  siteId           String
  name             String
  capacity         Int        @default(0)
  location         String?
  googleResourceId String     @unique
  displayUrl       String?
  photoUrl         String?
  status           RoomStatus @default(AVAILABLE)
  maintenance      Boolean    @default(false)
  active           Boolean    @default(true)
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  site           Site                 @relation(fields: [siteId], references: [id])
  facilities     RoomFacility[]
  meetings       MeetingCache[]
  bookings       Booking[]
  device         Device?
  syncState      SyncState?
  analyticsDaily AnalyticsDaily[]
  announcements  AnnouncementTarget[]

  @@index([siteId])
  @@map("rooms")
}

model Facility {
  id    String @id @default(uuid())
  name  String @unique
  icon  String?

  rooms RoomFacility[]

  @@map("facilities")
}

model RoomFacility {
  id         String @id @default(uuid())
  roomId     String
  facilityId String

  room     Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  facility Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)

  @@unique([roomId, facilityId])
  @@map("room_facilities")
}

// identity -----------------------------------------------------------------
model User {
  id          String    @id @default(uuid())
  googleId    String    @unique
  email       String    @unique
  name        String
  avatarUrl   String?
  role        UserRole  @default(EMPLOYEE)
  active      Boolean   @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  bookings      Booking[]
  checkIns      CheckIn[]
  logs          SystemLog[]
  announcements Announcement[]

  @@map("users")
}

// reservation mirror (source of truth = Google Calendar) -------------------
model MeetingCache {
  id             String        @id @default(uuid())
  roomId         String
  googleEventId  String
  icalUid        String?
  subject        String
  description    String?
  organizerEmail String?
  organizerName  String?
  startTime      DateTime
  endTime        DateTime
  meetUrl        String?
  zoomUrl        String?
  source         MeetingSource @default(GOOGLE_CALENDAR)
  syncedAt       DateTime      @default(now())

  room         Room                 @relation(fields: [roomId], references: [id], onDelete: Cascade)
  participants MeetingParticipant[]
  checkIn      CheckIn?
  booking      Booking?

  @@unique([roomId, googleEventId])
  @@index([roomId, startTime, endTime])
  @@map("meeting_cache")
}

model MeetingParticipant {
  id             String         @id @default(uuid())
  meetingCacheId String
  email          String
  name           String?
  responseStatus ResponseStatus @default(NEEDS_ACTION)

  meeting MeetingCache @relation(fields: [meetingCacheId], references: [id], onDelete: Cascade)

  @@index([meetingCacheId])
  @@map("meeting_participants")
}

// app-initiated booking (create-only against Google) -----------------------
model Booking {
  id             String        @id @default(uuid())
  roomId         String
  createdBy      String
  meetingCacheId String?       @unique
  subject        String
  purpose        String?
  startTime      DateTime
  endTime        DateTime
  googleEventId  String?
  status         BookingStatus @default(CREATED)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  room    Room          @relation(fields: [roomId], references: [id])
  creator User          @relation(fields: [createdBy], references: [id])
  meeting MeetingCache? @relation(fields: [meetingCacheId], references: [id])

  @@index([roomId, startTime])
  @@map("bookings")
}

// app-managed check-in / no-show (never touches Google) --------------------
model CheckIn {
  id             String       @id @default(uuid())
  meetingCacheId String       @unique
  checkedInBy    String?
  scheduledStart DateTime
  checkedInAt    DateTime?
  graceDeadline  DateTime
  state          CheckInState @default(PENDING)
  releasedAt     DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  meeting MeetingCache @relation(fields: [meetingCacheId], references: [id], onDelete: Cascade)
  user    User?        @relation(fields: [checkedInBy], references: [id])

  @@index([state, graceDeadline])
  @@map("check_ins")
}

// device monitoring --------------------------------------------------------
model Device {
  id              String       @id @default(uuid())
  roomId          String       @unique
  hostname        String
  agentTokenHash  String
  status          DeviceStatus @default(UNKNOWN)
  lastHeartbeatAt DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  room       Room             @relation(fields: [roomId], references: [id])
  heartbeats DeviceHeartbeat[]

  @@map("devices")
}

model DeviceHeartbeat {
  id                  String   @id @default(uuid())
  deviceId            String
  cpuUsage            Float?
  ramUsage            Float?
  storageUsage        Float?
  internetOk          Boolean  @default(true)
  chromeRunning       Boolean  @default(false)
  displayRunning      Boolean  @default(false)
  webcamConnected     Boolean  @default(false)
  microphoneConnected Boolean  @default(false)
  tvConnected         Boolean  @default(false)
  lastCalendarSync    DateTime?
  createdAt           DateTime @default(now())

  device Device @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  @@index([deviceId, createdAt])
  @@map("device_heartbeats")
}

// announcements ------------------------------------------------------------
model Announcement {
  id        String            @id @default(uuid())
  createdBy String
  title     String
  message   String
  scope     AnnouncementScope @default(GLOBAL)
  startsAt  DateTime?
  expiresAt DateTime?
  active    Boolean           @default(true)
  createdAt DateTime          @default(now())

  creator User                 @relation(fields: [createdBy], references: [id])
  targets AnnouncementTarget[]

  @@map("announcements")
}

model AnnouncementTarget {
  id             String  @id @default(uuid())
  announcementId String
  siteId         String?
  roomId         String?

  announcement Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  site         Site?        @relation(fields: [siteId], references: [id])
  room         Room?        @relation(fields: [roomId], references: [id])

  @@index([announcementId])
  @@map("announcement_targets")
}

// analytics rollup ---------------------------------------------------------
model AnalyticsDaily {
  id              String   @id @default(uuid())
  roomId          String
  day             DateTime @db.Date
  totalMeetings   Int      @default(0)
  meetingMinutes  Int      @default(0)
  noShows         Int      @default(0)
  occupiedMinutes Int      @default(0)
  occupancyRate   Float    @default(0)

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([roomId, day])
  @@index([day])
  @@map("analytics_daily")
}

// logs & config ------------------------------------------------------------
model SystemLog {
  id          String   @id @default(uuid())
  actorUserId String?
  logType     LogType  @default(SYSTEM)
  action      String
  targetType  String?
  targetId    String?
  metadata    Json?
  createdAt   DateTime @default(now())

  actor User? @relation(fields: [actorUserId], references: [id])

  @@index([createdAt])
  @@index([logType, createdAt])
  @@map("system_logs")
}

model Setting {
  id        String   @id @default(uuid())
  key       String
  value     Json
  scope     String   @default("global")
  updatedAt DateTime @updatedAt

  @@unique([key, scope])
  @@map("settings")
}

// per-room sync bookkeeping -----------------------------------------------
model SyncState {
  id              String     @id @default(uuid())
  roomId          String     @unique
  syncToken       String?
  watchChannelId  String?
  watchResourceId String?
  watchExpiresAt  DateTime?
  lastStatus      SyncStatus @default(SUCCESS)
  lastError       String?
  lastSyncedAt    DateTime?

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@map("sync_state")
}
```

---

## 3. Seed / Default Data (design intent)

| Data | Purpose |
|------|---------|
| Sites: BB, GP, Jembrana | Match current deployment (5/3/6 rooms) |
| Facilities master | e.g., Projector, Whiteboard, VC Camera, Speakerphone, TV |
| Settings | `startingSoonLeadMinutes` (default 10), `noShowGraceMinutes` (default 15), `syncIntervalSeconds`, `deviceOfflineThresholdSeconds` |
| First Administrator | Bootstrapped from an allowed Workspace admin email |

---

## 4. Retention & Maintenance

| Table | Policy |
|-------|--------|
| device_heartbeats | Keep raw N days (configurable), then rely on rollups |
| meeting_cache | Past events retained per privacy policy, then purged/aggregated |
| system_logs | Retain per audit policy (pending stakeholder input) |
| analytics_daily | Long-term retention (small footprint) |

---

## 5. Consistency Notes

- Booking uniqueness against Calendar is ultimately enforced by Google; the app
  performs a pre-check against `meeting_cache` and links back by `googleEventId`
  after sync.
- Check-in/no-show transitions occur in transactions; the no-show sweep worker
  queries `CheckIn(state=PENDING, graceDeadline < now)`.
- All timestamps stored in UTC; display uses `Site.timezone`.

---

*End of Database Schema.*
