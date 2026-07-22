-- MRMS Enterprise Schema migration (Phase 1).
-- ADDITIVE ONLY. Extends the Sprint-1A foundation (users/system_logs/settings).
-- The Prisma-generated section (enums, tables, indexes, FKs) is followed by the
-- raw-SQL blocks that Prisma cannot express (Architecture Freeze §6/§9).

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'STARTING_SOON', 'MAINTENANCE', 'RESERVED');

-- CreateEnum
CREATE TYPE "MeetingSource" AS ENUM ('GOOGLE_CALENDAR', 'APP_BOOKING');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('ACCEPTED', 'DECLINED', 'TENTATIVE', 'NEEDS_ACTION');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CREATED', 'SYNCED', 'FAILED', 'CANCELLED_EXTERNALLY');

-- CreateEnum
CREATE TYPE "CheckInState" AS ENUM ('PENDING', 'CHECKED_IN', 'NO_SHOW', 'RELEASED');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'DEGRADED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AnnouncementScope" AS ENUM ('GLOBAL', 'SITE', 'ROOM');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "AnalyticsGranularity" AS ENUM ('DAY', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "AnalyticsScopeType" AS ENUM ('ROOM', 'SITE', 'ORG');

-- CreateEnum
CREATE TYPE "CalendarProviderType" AS ENUM ('GOOGLE', 'MICROSOFT', 'EXCHANGE', 'ICAL');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default_timezone" TEXT NOT NULL DEFAULT 'Asia/Makassar',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Makassar',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "site_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "label" TEXT,
    "expires_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "calendar_provider_id" TEXT,
    "external_resource_id" TEXT,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "display_url" TEXT,
    "photo_url" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "status_changed_at" TIMESTAMPTZ(6),
    "maintenance" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_facilities" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,

    CONSTRAINT "room_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_providers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "site_id" TEXT,
    "type" "CalendarProviderType" NOT NULL,
    "display_name" TEXT NOT NULL,
    "config" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "calendar_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_state" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sync_token" TEXT,
    "watch_channel_id" TEXT,
    "watch_resource_id" TEXT,
    "watch_expires_at" TIMESTAMPTZ(6),
    "last_status" "SyncStatus" NOT NULL DEFAULT 'SUCCESS',
    "last_error" TEXT,
    "last_synced_at" TIMESTAMPTZ(6),

    CONSTRAINT "sync_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_cache" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "calendar_provider_id" TEXT,
    "external_event_id" TEXT NOT NULL,
    "ical_uid" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "organizer_email" TEXT,
    "organizer_name" TEXT,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "meet_url" TEXT,
    "zoom_url" TEXT,
    "source" "MeetingSource" NOT NULL DEFAULT 'GOOGLE_CALENDAR',
    "canceled_at" TIMESTAMPTZ(6),
    "synced_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_participants" (
    "id" TEXT NOT NULL,
    "meeting_cache_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "response_status" "ResponseStatus" NOT NULL DEFAULT 'NEEDS_ACTION',

    CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "created_by" TEXT,
    "meeting_cache_id" TEXT,
    "calendar_provider_id" TEXT,
    "subject" TEXT NOT NULL,
    "purpose" TEXT,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "external_event_id" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'CREATED',
    "idempotency_key" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_participants" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "meeting_cache_id" TEXT NOT NULL,
    "checked_in_by" TEXT,
    "scheduled_start" TIMESTAMPTZ(6) NOT NULL,
    "checked_in_at" TIMESTAMPTZ(6),
    "grace_deadline" TIMESTAMPTZ(6) NOT NULL,
    "state" "CheckInState" NOT NULL DEFAULT 'PENDING',
    "released_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "current_room_id" TEXT,
    "hostname" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'UNKNOWN',
    "agent_version" TEXT,
    "last_heartbeat_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_assignments" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMPTZ(6),
    "assigned_by" TEXT,

    CONSTRAINT "device_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_heartbeats" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "cpu_usage" DOUBLE PRECISION,
    "ram_usage" DOUBLE PRECISION,
    "storage_usage" DOUBLE PRECISION,
    "internet_ok" BOOLEAN NOT NULL DEFAULT true,
    "chrome_running" BOOLEAN NOT NULL DEFAULT false,
    "display_running" BOOLEAN NOT NULL DEFAULT false,
    "webcam_connected" BOOLEAN NOT NULL DEFAULT false,
    "microphone_connected" BOOLEAN NOT NULL DEFAULT false,
    "tv_connected" BOOLEAN NOT NULL DEFAULT false,
    "last_calendar_sync" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_heartbeats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "created_by" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scope" "AnnouncementScope" NOT NULL DEFAULT 'GLOBAL',
    "starts_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_targets" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "site_id" TEXT,
    "room_id" TEXT,

    CONSTRAINT "announcement_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_rollup" (
    "id" TEXT NOT NULL,
    "granularity" "AnalyticsGranularity" NOT NULL,
    "scope_type" "AnalyticsScopeType" NOT NULL,
    "scope_id" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "total_meetings" INTEGER NOT NULL DEFAULT 0,
    "meeting_minutes" INTEGER NOT NULL DEFAULT 0,
    "occupied_minutes" INTEGER NOT NULL DEFAULT 0,
    "no_shows" INTEGER NOT NULL DEFAULT 0,
    "cancelled_count" INTEGER NOT NULL DEFAULT 0,
    "occupancy_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "analytics_rollup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_outbox" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "sites_organization_id_idx" ON "sites"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "sites_organization_id_code_key" ON "sites"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_hash_key" ON "device_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "device_tokens_device_id_idx" ON "device_tokens"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_name_key" ON "facilities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_display_url_key" ON "rooms"("display_url");

-- CreateIndex
CREATE INDEX "rooms_site_id_idx" ON "rooms"("site_id");

-- CreateIndex
CREATE INDEX "rooms_organization_id_active_idx" ON "rooms"("organization_id", "active");

-- CreateIndex
CREATE INDEX "rooms_status_idx" ON "rooms"("status");

-- CreateIndex
CREATE INDEX "room_facilities_facility_id_idx" ON "room_facilities"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_facilities_room_id_facility_id_key" ON "room_facilities"("room_id", "facility_id");

-- CreateIndex
CREATE INDEX "calendar_providers_organization_id_idx" ON "calendar_providers"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "sync_state_room_id_key" ON "sync_state"("room_id");

-- CreateIndex
CREATE INDEX "meeting_cache_room_id_start_time_end_time_idx" ON "meeting_cache"("room_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "meeting_cache_organization_id_start_time_idx" ON "meeting_cache"("organization_id", "start_time");

-- CreateIndex
CREATE INDEX "meeting_cache_start_time_idx" ON "meeting_cache"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_cache_room_id_external_event_id_key" ON "meeting_cache"("room_id", "external_event_id");

-- CreateIndex
CREATE INDEX "meeting_participants_meeting_cache_id_idx" ON "meeting_participants"("meeting_cache_id");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_participants_meeting_cache_id_email_key" ON "meeting_participants"("meeting_cache_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_meeting_cache_id_key" ON "bookings"("meeting_cache_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_idempotency_key_key" ON "bookings"("idempotency_key");

-- CreateIndex
CREATE INDEX "bookings_room_id_start_time_idx" ON "bookings"("room_id", "start_time");

-- CreateIndex
CREATE INDEX "booking_participants_booking_id_idx" ON "booking_participants"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_participants_booking_id_email_key" ON "booking_participants"("booking_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_meeting_cache_id_key" ON "check_ins"("meeting_cache_id");

-- CreateIndex
CREATE INDEX "check_ins_state_grace_deadline_idx" ON "check_ins"("state", "grace_deadline");

-- CreateIndex
CREATE UNIQUE INDEX "devices_current_room_id_key" ON "devices"("current_room_id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_hostname_key" ON "devices"("hostname");

-- CreateIndex
CREATE INDEX "devices_status_idx" ON "devices"("status");

-- CreateIndex
CREATE INDEX "device_assignments_room_id_assigned_at_idx" ON "device_assignments"("room_id", "assigned_at");

-- CreateIndex
CREATE INDEX "device_heartbeats_device_id_created_at_idx" ON "device_heartbeats"("device_id", "created_at");

-- CreateIndex
CREATE INDEX "announcements_active_starts_at_expires_at_idx" ON "announcements"("active", "starts_at", "expires_at");

-- CreateIndex
CREATE INDEX "announcement_targets_announcement_id_idx" ON "announcement_targets"("announcement_id");

-- CreateIndex
CREATE INDEX "analytics_rollup_scope_type_scope_id_period_start_idx" ON "analytics_rollup"("scope_type", "scope_id", "period_start");

-- CreateIndex
CREATE INDEX "analytics_rollup_granularity_period_start_idx" ON "analytics_rollup"("granularity", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_rollup_granularity_scope_type_scope_id_period_sta_key" ON "analytics_rollup"("granularity", "scope_type", "scope_id", "period_start");

-- CreateIndex
CREATE INDEX "event_outbox_aggregate_type_aggregate_id_idx" ON "event_outbox"("aggregate_type", "aggregate_id");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_calendar_provider_id_fkey" FOREIGN KEY ("calendar_provider_id") REFERENCES "calendar_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_providers" ADD CONSTRAINT "calendar_providers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_providers" ADD CONSTRAINT "calendar_providers_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_state" ADD CONSTRAINT "sync_state_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_cache" ADD CONSTRAINT "meeting_cache_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_cache" ADD CONSTRAINT "meeting_cache_calendar_provider_id_fkey" FOREIGN KEY ("calendar_provider_id") REFERENCES "calendar_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meeting_cache_id_fkey" FOREIGN KEY ("meeting_cache_id") REFERENCES "meeting_cache"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_meeting_cache_id_fkey" FOREIGN KEY ("meeting_cache_id") REFERENCES "meeting_cache"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_calendar_provider_id_fkey" FOREIGN KEY ("calendar_provider_id") REFERENCES "calendar_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_meeting_cache_id_fkey" FOREIGN KEY ("meeting_cache_id") REFERENCES "meeting_cache"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_checked_in_by_fkey" FOREIGN KEY ("checked_in_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_current_room_id_fkey" FOREIGN KEY ("current_room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_heartbeats" ADD CONSTRAINT "device_heartbeats_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_targets" ADD CONSTRAINT "announcement_targets_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_targets" ADD CONSTRAINT "announcement_targets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_targets" ADD CONSTRAINT "announcement_targets_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_targets" ADD CONSTRAINT "announcement_targets_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- RAW SQL (Architecture Freeze §6/§9) — features Prisma cannot express.
-- Additive only. No Phase 8 / Phase 13 / Phase 15 objects here.
-- =============================================================================

-- [1] UserRole scope uniqueness: NULL scope means "the single global/org scope"
-- and must dedupe. NULLS NOT DISTINCT treats NULLs as equal (PostgreSQL 15+).
CREATE UNIQUE INDEX "user_roles_user_role_scope_key"
    ON "user_roles" ("user_id", "role_id", "organization_id", "site_id")
    NULLS NOT DISTINCT;

-- [2] One calendar provider per (organization, type[, site]); NULL site = org-wide.
CREATE UNIQUE INDEX "calendar_providers_org_type_site_key"
    ON "calendar_providers" ("organization_id", "type", "site_id")
    NULLS NOT DISTINCT;

-- [3] Room external-calendar mapping unique ONLY when mapped; many unmapped rooms
-- (both NULL) are allowed -> partial unique (opposite intent to [1]/[2]).
CREATE UNIQUE INDEX "rooms_calendar_ref_key"
    ON "rooms" ("calendar_provider_id", "external_resource_id")
    WHERE "calendar_provider_id" IS NOT NULL AND "external_resource_id" IS NOT NULL;

-- [4] At most one active (unassigned_at IS NULL) device assignment per room.
CREATE UNIQUE INDEX "device_assignments_active_room_key"
    ON "device_assignments" ("room_id")
    WHERE "unassigned_at" IS NULL;

-- [5] Valid time ranges.
ALTER TABLE "meeting_cache"
    ADD CONSTRAINT "meeting_cache_time_range_chk" CHECK ("end_time" > "start_time");
ALTER TABLE "bookings"
    ADD CONSTRAINT "bookings_time_range_chk" CHECK ("end_time" > "start_time");

-- [6] Non-negative room capacity.
ALTER TABLE "rooms"
    ADD CONSTRAINT "rooms_capacity_chk" CHECK ("capacity" >= 0);

-- [7] Heartbeat usage metrics within 0..100 (NULL allowed = not reported).
ALTER TABLE "device_heartbeats"
    ADD CONSTRAINT "device_heartbeats_usage_chk" CHECK (
        ("cpu_usage" IS NULL OR ("cpu_usage" >= 0 AND "cpu_usage" <= 100)) AND
        ("ram_usage" IS NULL OR ("ram_usage" >= 0 AND "ram_usage" <= 100)) AND
        ("storage_usage" IS NULL OR ("storage_usage" >= 0 AND "storage_usage" <= 100))
    );

-- [8] Grace deadline cannot precede scheduled start.
ALTER TABLE "check_ins"
    ADD CONSTRAINT "check_ins_grace_chk" CHECK ("grace_deadline" >= "scheduled_start");

-- [9] AnnouncementTarget: at most one of (org, site, room) is set
-- (all NULL = GLOBAL scope).
ALTER TABLE "announcement_targets"
    ADD CONSTRAINT "announcement_targets_scope_chk" CHECK (
        (("organization_id" IS NOT NULL)::int
         + ("site_id" IS NOT NULL)::int
         + ("room_id" IS NOT NULL)::int) <= 1
    );

-- [10] AnalyticsRollup: scope_type validity is enforced by the enum type;
-- add a sanity bound on the derived occupancy_rate.
ALTER TABLE "analytics_rollup"
    ADD CONSTRAINT "analytics_rollup_occupancy_chk" CHECK ("occupancy_rate" >= 0);

-- [11] EventOutbox relay queue: partial index over unpublished rows only.
CREATE INDEX "event_outbox_unpublished_idx"
    ON "event_outbox" ("occurred_at")
    WHERE "published_at" IS NULL;

-- [12] HOT-update fillfactor on hot-updated tables (status/heartbeat churn).
ALTER TABLE "rooms" SET (fillfactor = 80);
ALTER TABLE "sync_state" SET (fillfactor = 80);
ALTER TABLE "devices" SET (fillfactor = 80);
