/**
 * Idempotent database seed (Phase 1 — Enterprise Database).
 *
 * Seeds the reference/system data required by the frozen architecture, in the
 * frozen dependency order:
 *   Organization -> Sites -> Facilities -> Settings -> Permissions -> Roles
 *   -> RolePermissions -> (bootstrap Admin + UserRole, conditional)
 *   -> CalendarProvider.
 *
 * Every write is an UPSERT keyed by a natural key, so this is safe to run
 * repeatedly (dev, CI, first deploy) without creating duplicates. Operator-tuned
 * values (e.g. Settings) are never overwritten on re-seed.
 */
import { CalendarProviderType, PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// --- reference data -------------------------------------------------------

const ORG = { slug: 'mitra-prodin', name: 'PT Mitra Prodin', defaultTimezone: 'Asia/Makassar' };

const SITES: { code: string; name: string }[] = [
  { code: 'BB', name: 'BB' },
  { code: 'GP', name: 'GP' },
  { code: 'JEMBRANA', name: 'Jembrana' },
];

const FACILITIES: { name: string; icon: string }[] = [
  { name: 'Projector', icon: 'projector' },
  { name: 'Whiteboard', icon: 'whiteboard' },
  { name: 'VC Camera', icon: 'camera' },
  { name: 'Speakerphone', icon: 'mic' },
  { name: 'TV', icon: 'tv' },
];

const DEFAULT_SETTINGS: { key: string; value: unknown }[] = [
  { key: 'startingSoonLeadMinutes', value: 10 },
  { key: 'noShowGraceMinutes', value: 15 },
  { key: 'syncIntervalSeconds', value: 60 },
  { key: 'deviceOfflineThresholdSeconds', value: 120 },
];

const PERMISSIONS: { key: string; description: string }[] = [
  { key: 'site.manage', description: 'Create/update sites' },
  { key: 'room.manage', description: 'Create/update rooms and maintenance' },
  { key: 'room.view', description: 'View rooms and schedules' },
  { key: 'facility.manage', description: 'Manage facilities catalog' },
  { key: 'sync.trigger', description: 'Trigger calendar sync' },
  { key: 'sync.view', description: 'View sync status/history' },
  { key: 'booking.create', description: 'Create bookings' },
  { key: 'booking.view', description: 'View bookings' },
  { key: 'checkin.perform', description: 'Perform check-in' },
  { key: 'device.manage', description: 'Manage devices/tokens' },
  { key: 'device.view', description: 'View device monitoring' },
  { key: 'announcement.manage', description: 'Create/broadcast announcements' },
  { key: 'analytics.view', description: 'View analytics dashboards' },
  { key: 'settings.manage', description: 'Manage runtime settings' },
  { key: 'user.manage', description: 'Manage users and roles' },
  { key: 'audit.view', description: 'View audit logs' },
];

const EMPLOYEE_PERMISSION_KEYS = new Set([
  'room.view',
  'booking.create',
  'booking.view',
  'checkin.perform',
]);

const ROLES: { key: string; name: string; description: string }[] = [
  { key: 'ADMINISTRATOR', name: 'Administrator', description: 'Full administrative access' },
  { key: 'EMPLOYEE', name: 'Employee', description: 'Standard employee access' },
];

// --- seed steps -----------------------------------------------------------

async function seedOrganization(): Promise<string> {
  const org = await prisma.organization.upsert({
    where: { slug: ORG.slug },
    update: {},
    create: { slug: ORG.slug, name: ORG.name, defaultTimezone: ORG.defaultTimezone },
  });
  return org.id;
}

async function seedSites(organizationId: string): Promise<void> {
  for (const site of SITES) {
    await prisma.site.upsert({
      where: { organizationId_code: { organizationId, code: site.code } },
      update: {},
      create: { organizationId, code: site.code, name: site.name, timezone: ORG.defaultTimezone },
    });
  }
}

async function seedFacilities(): Promise<void> {
  for (const facility of FACILITIES) {
    await prisma.facility.upsert({
      where: { name: facility.name },
      update: { icon: facility.icon },
      create: { name: facility.name, icon: facility.icon },
    });
  }
}

async function seedSettings(): Promise<void> {
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key_scope: { key: setting.key, scope: 'global' } },
      update: {}, // never overwrite operator-tuned values on re-seed
      create: { key: setting.key, scope: 'global', value: setting.value as object },
    });
  }
}

async function seedPermissions(): Promise<Map<string, string>> {
  const byKey = new Map<string, string>();
  for (const perm of PERMISSIONS) {
    const row = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: { key: perm.key, description: perm.description },
    });
    byKey.set(perm.key, row.id);
  }
  return byKey;
}

async function seedRoles(): Promise<Map<string, string>> {
  const byKey = new Map<string, string>();
  for (const role of ROLES) {
    const row = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description, isSystem: true },
      create: { key: role.key, name: role.name, description: role.description, isSystem: true },
    });
    byKey.set(role.key, row.id);
  }
  return byKey;
}

async function seedRolePermissions(
  roles: Map<string, string>,
  permissions: Map<string, string>,
): Promise<void> {
  const adminRoleId = roles.get('ADMINISTRATOR')!;
  const employeeRoleId = roles.get('EMPLOYEE')!;

  for (const [key, permissionId] of permissions) {
    // Administrator gets every permission.
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRoleId, permissionId } },
      update: {},
      create: { roleId: adminRoleId, permissionId },
    });
    // Employee gets the standard subset.
    if (EMPLOYEE_PERMISSION_KEYS.has(key)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: employeeRoleId, permissionId } },
        update: {},
        create: { roleId: employeeRoleId, permissionId },
      });
    }
  }
}

async function seedBootstrapAdmin(roles: Map<string, string>): Promise<void> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) {
    // eslint-disable-next-line no-console
    console.log('[seed] ADMIN_BOOTSTRAP_EMAIL not set; skipping bootstrap admin.');
    return;
  }

  // Placeholder googleId until the OAuth flow (Phase 5) reconciles the real
  // Google subject on first login (OAuth upserts by email/googleId).
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.ADMINISTRATOR, active: true },
    create: {
      email,
      googleId: `pending:${email}`,
      name: 'Bootstrap Administrator',
      role: UserRole.ADMINISTRATOR,
    },
  });

  // Global ADMINISTRATOR assignment (organizationId/siteId NULL = global scope).
  // No Prisma compound unique here (NULLS NOT DISTINCT is a raw index), so guard
  // idempotency with findFirst.
  const adminRoleId = roles.get('ADMINISTRATOR')!;
  const existing = await prisma.userRoleAssignment.findFirst({
    where: { userId: admin.id, roleId: adminRoleId, organizationId: null, siteId: null },
  });
  if (!existing) {
    await prisma.userRoleAssignment.create({
      data: { userId: admin.id, roleId: adminRoleId },
    });
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] Ensured bootstrap admin ${email}.`);
}

async function seedCalendarProvider(organizationId: string): Promise<void> {
  // Org-wide Google provider, inactive until credentials land (Phase 7).
  // (organizationId, type, siteId=NULL) uniqueness is a raw NULLS NOT DISTINCT
  // index, so guard idempotency with findFirst.
  const existing = await prisma.calendarProvider.findFirst({
    where: { organizationId, type: CalendarProviderType.GOOGLE, siteId: null },
  });
  if (!existing) {
    await prisma.calendarProvider.create({
      data: {
        organizationId,
        type: CalendarProviderType.GOOGLE,
        displayName: 'Google Workspace',
        active: false,
      },
    });
  }
}

async function main(): Promise<void> {
  const organizationId = await seedOrganization();
  await seedSites(organizationId);
  await seedFacilities();
  await seedSettings();
  const permissions = await seedPermissions();
  const roles = await seedRoles();
  await seedRolePermissions(roles, permissions);
  await seedBootstrapAdmin(roles);
  await seedCalendarProvider(organizationId);
  // eslint-disable-next-line no-console
  console.log('[seed] Reference/system data ensured.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('[seed] Failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
