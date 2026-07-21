/**
 * Idempotent database seed (Sprint 1A).
 *
 * Seeds the runtime Settings with the approved defaults (status windows, sync
 * interval, device offline threshold - Doc 08 §3, Doc 12 §7). Safe to run
 * repeatedly (upsert by unique (key, scope)).
 *
 * The bootstrap Administrator is intentionally NOT seeded here: user identity is
 * owned by Google Workspace OAuth, which lands in Sprint 1B. Seeding a synthetic
 * identity now would be dummy data and could conflict with the OAuth upsert.
 * The `ADMIN_BOOTSTRAP_EMAIL` env var is reserved for that sprint.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SettingSeed {
  key: string;
  value: unknown;
}

const DEFAULT_SETTINGS: SettingSeed[] = [
  { key: 'startingSoonLeadMinutes', value: 10 },
  { key: 'noShowGraceMinutes', value: 15 },
  { key: 'syncIntervalSeconds', value: 60 },
  { key: 'deviceOfflineThresholdSeconds', value: 120 },
];

async function seedSettings(): Promise<void> {
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key_scope: { key: setting.key, scope: 'global' } },
      update: {}, // Do not overwrite operator-tuned values on re-seed.
      create: { key: setting.key, scope: 'global', value: setting.value as object },
    });
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] Ensured ${DEFAULT_SETTINGS.length} global settings.`);
}

async function main(): Promise<void> {
  await seedSettings();

  if (process.env.ADMIN_BOOTSTRAP_EMAIL) {
    // eslint-disable-next-line no-console
    console.log(
      '[seed] ADMIN_BOOTSTRAP_EMAIL is set; bootstrap admin provisioning is handled by the OAuth flow in Sprint 1B (not seeded here).',
    );
  }
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
