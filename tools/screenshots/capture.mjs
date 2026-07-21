// MRMS UI screenshot capture (Playwright / Chromium).
//
// Captures light + dark screenshots of the built SPAs. Intended to run whenever
// the frontend changes (locally via `pnpm screenshots` or an agent hook, and in
// CI once browsers are provisioned).
//
// Usage:
//   SHOT_TARGETS="admin=http://localhost:4173,display=http://localhost:4174" \
//   SHOT_OUT="docs/reports/sprint-1a/screenshots" \
//   node tools/screenshots/capture.mjs
//
// Requires: `playwright` (or @playwright/test) available on the module path and
// Chromium installed (`npx playwright install chromium`).

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const targetsRaw =
  process.env.SHOT_TARGETS ||
  'admin=http://localhost:4173,display=http://localhost:4174';
const outDir = resolve(process.env.SHOT_OUT || 'docs/reports/sprint-1a/screenshots');

const targets = targetsRaw
  .split(',')
  .map((pair) => pair.trim())
  .filter(Boolean)
  .map((pair) => {
    const [name, url] = pair.split('=');
    return { name: name.trim(), url: url.trim() };
  });

const viewport = { width: 1440, height: 900 };
const schemes = ['light', 'dark'];

async function run() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = [];

  for (const { name, url } of targets) {
    for (const scheme of schemes) {
      const context = await browser.newContext({ viewport, colorScheme: scheme });
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      } catch {
        // Foundation SPAs call the backend on load; with no backend the app
        // still renders its shell/error state. Give it a moment and continue.
        await page.waitForTimeout(1500);
      }
      await page.waitForTimeout(800);
      const file = resolve(outDir, `${name}-${scheme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      results.push(file);
      // eslint-disable-next-line no-console
      console.log(`captured ${file}`);
      await context.close();
    }
  }

  await browser.close();
  // eslint-disable-next-line no-console
  console.log(`DONE ${results.length} screenshots -> ${outDir}`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('SCREENSHOT_FAILED', err);
  process.exit(1);
});
