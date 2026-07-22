/**
 * Enterprise-schema database integration tests (PENDING — Database Required).
 *
 * These validate the raw-SQL constraints from the migration that Prisma cannot
 * express (NULLS NOT DISTINCT uniqueness, partial uniqueness, CHECKs) plus seed
 * idempotency. They require a REAL, migrated PostgreSQL database and are skipped
 * unless `RUN_DB_IT=1` is set.
 *
 * Run (once a database is reachable):
 *   DATABASE_URL=... npx prisma migrate deploy
 *   DATABASE_URL=... RUN_DB_IT=1 pnpm --filter @mrms/backend run test:it
 */
import { randomUUID } from 'node:crypto';

import { CalendarProviderType, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const run = process.env.RUN_DB_IT ? describe : describe.skip;

/** Resolve a promise's rejection error (or undefined if it resolved). */
async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
    return undefined;
  } catch (error) {
    return error;
  }
}

/** Unique-constraint violation (Postgres 23505 -> Prisma P2002). */
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

/** CHECK-constraint (and other raw-query) violations surface as P2010. */
function isConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2010' || error.code === 'P2002')
  );
}

run('Enterprise schema — DB constraints', () => {
  let organizationId: string;
  let roleId: string;
  let userId: string;

  beforeAll(async () => {
    await prisma.$connect();
    const org = await prisma.organization.upsert({
      where: { slug: 'it-org' },
      update: {},
      create: { slug: 'it-org', name: 'IT Org' },
    });
    organizationId = org.id;
    const role = await prisma.role.upsert({
      where: { key: 'IT_ROLE' },
      update: {},
      create: { key: 'IT_ROLE', name: 'IT Role' },
    });
    roleId = role.id;
    const user = await prisma.user.upsert({
      where: { email: 'it-user@example.com' },
      update: {},
      create: { email: 'it-user@example.com', googleId: `it:${randomUUID()}`, name: 'IT User' },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('[#1] user_roles: rejects a duplicate global assignment (NULLS NOT DISTINCT)', async () => {
    await prisma.userRoleAssignment.create({ data: { userId, roleId } });
    const error = await captureError(
      prisma.userRoleAssignment.create({ data: { userId, roleId } }),
    );
    expect(isUniqueViolation(error)).toBe(true);
  });

  it('[#3] rooms: allows many unmapped rooms but rejects duplicate calendar refs', async () => {
    const site = await prisma.site.upsert({
      where: { organizationId_code: { organizationId, code: 'IT' } },
      update: {},
      create: { organizationId, code: 'IT', name: 'IT Site' },
    });
    const base = { siteId: site.id, organizationId };
    // Two unmapped rooms (both calendar fields NULL) are permitted.
    await prisma.room.create({ data: { ...base, name: 'Unmapped A' } });
    await prisma.room.create({ data: { ...base, name: 'Unmapped B' } });

    const provider = await prisma.calendarProvider.create({
      data: { organizationId, type: CalendarProviderType.GOOGLE, displayName: 'IT GCal' },
    });
    const ref = { calendarProviderId: provider.id, externalResourceId: `res-${randomUUID()}` };
    await prisma.room.create({ data: { ...base, name: 'Mapped A', ...ref } });
    const error = await captureError(
      prisma.room.create({ data: { ...base, name: 'Mapped B', ...ref } }),
    );
    expect(isUniqueViolation(error)).toBe(true);
  });

  it('[#5] meeting_cache: rejects end_time <= start_time (CHECK)', async () => {
    const site = await prisma.site.findFirstOrThrow({ where: { organizationId } });
    const room = await prisma.room.create({
      data: { siteId: site.id, organizationId, name: 'Chk Room' },
    });
    const now = new Date();
    const error = await captureError(
      prisma.meetingCache.create({
        data: {
          roomId: room.id,
          organizationId,
          externalEventId: `evt-${randomUUID()}`,
          subject: 'bad range',
          startTime: now,
          endTime: new Date(now.getTime() - 60_000),
        },
      }),
    );
    expect(isConstraintError(error)).toBe(true);
  });

  it('[#6] rooms: rejects negative capacity (CHECK)', async () => {
    const site = await prisma.site.findFirstOrThrow({ where: { organizationId } });
    const error = await captureError(
      prisma.room.create({
        data: { siteId: site.id, organizationId, name: 'Neg Cap', capacity: -1 },
      }),
    );
    expect(isConstraintError(error)).toBe(true);
  });

  it('[#9] announcement_targets: rejects more than one target scope (CHECK)', async () => {
    const site = await prisma.site.findFirstOrThrow({ where: { organizationId } });
    const room = await prisma.room.create({
      data: { siteId: site.id, organizationId, name: 'Ann Room' },
    });
    const ann = await prisma.announcement.create({ data: { title: 'IT', message: 'IT' } });
    const error = await captureError(
      prisma.announcementTarget.create({
        data: { announcementId: ann.id, siteId: site.id, roomId: room.id },
      }),
    );
    expect(isConstraintError(error)).toBe(true);
  });
});

run('Enterprise schema — seed idempotency', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('upserting the same facility twice does not create duplicates', async () => {
    const name = `IT Facility ${randomUUID()}`;
    await prisma.facility.upsert({ where: { name }, update: {}, create: { name } });
    await prisma.facility.upsert({ where: { name }, update: {}, create: { name } });
    const count = await prisma.facility.count({ where: { name } });
    expect(count).toBe(1);
  });
});
