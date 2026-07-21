# UI Screenshots (Playwright) — Sprint 1A

> **Purpose:** Provide automated UI screenshots of the SPAs and the tooling to regenerate them whenever the frontend changes.
> **Scope:** `apps/admin` and `apps/display` (light + dark).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [Frontend Architecture](../../15-Frontend-Architecture.md), [UI/UX Wireframe](../../13-UIUX-Wireframe.md), [NFR §7 Usability](../../03-NFR-Non-Functional-Requirements.md)

---

## 1. Tooling (committed, reusable)

A reusable Playwright capture script is committed at
[`tools/screenshots/capture.mjs`](../../../tools/screenshots/capture.mjs). It
launches Chromium and captures **light + dark** full-page screenshots of each
configured target into an output directory.

```bash
# 1) Build the SPAs (produces apps/*/dist)
pnpm -r build

# 2) Serve the built SPAs (two terminals, or background)
pnpm --filter @mrms/admin   exec vite preview --port 4173 --strictPort
pnpm --filter @mrms/display exec vite preview --port 4174 --strictPort

# 3) Ensure Playwright + Chromium are available
npm i -D @playwright/test && npx playwright install chromium

# 4) Capture
SHOT_TARGETS="admin=http://localhost:4173,display=http://localhost:4174" \
SHOT_OUT="docs/reports/sprint-1a/screenshots" \
node tools/screenshots/capture.mjs
```

Output files: `admin-light.png`, `admin-dark.png`, `display-light.png`,
`display-dark.png` in `docs/reports/sprint-1a/screenshots/`.

## 2. Automation "whenever the frontend changes" (Requirement #13)

Two complementary mechanisms:

1. **Kiro agent hook** — a `PostFileSave` hook matching `apps/(admin|display)/.*\.(tsx|ts|css)$`
   runs the capture flow after frontend edits. See
   [`.kiro/hooks/ui-screenshots-on-frontend-change.json`](../../../.kiro/hooks/ui-screenshots-on-frontend-change.json)
   (created in the workspace; regenerate via the Kiro Hook UI if not present).
2. **CI job (recommended)** — run the same script in CI on PRs that touch
   `apps/admin/**` or `apps/display/**`, uploading the PNGs as build artifacts.
   Tracked as a follow-up in the [technical backlog](../../backlog/technical-backlog.md).

## 3. Execution status in this environment (honest note)

The capture was **attempted** during Sprint 1A close-out:

- ✅ `tools/screenshots/capture.mjs` committed.
- ✅ Both SPAs built (`apps/*/dist` present) and served via `vite preview` (4173/4174).
- ✅ Chromium download initiated via `npx playwright install chromium` (140 MiB downloaded).
- ⛔ **Final capture did not complete.** The Chromium binary was not fully
  provisioned at the expected path (`ms-playwright/chromium-1140/.../chrome.exe`)
  and, shortly after, the sandbox's interactive shell became unresponsive
  (commands stopped executing). No PNG files were produced.

**Status: NOT GENERATED in this environment.** The tooling is in place and the
exact commands above reproduce the screenshots on any host with a working shell
and Playwright browsers installed. Once regenerated, the four PNGs should be
committed under `docs/reports/sprint-1a/screenshots/` and linked below.

## 4. Screenshots

| App | Light | Dark |
|-----|-------|------|
| Admin | `screenshots/admin-light.png` _(pending regeneration)_ | `screenshots/admin-dark.png` _(pending)_ |
| Display | `screenshots/display-light.png` _(pending)_ | `screenshots/display-dark.png` _(pending)_ |

> Note: the foundation SPAs call the backend on load; with no backend running,
> the app renders its shell + graceful error/loading state, which is acceptable
> for a foundation UI snapshot.

## 5. Action

| ID | Action | When |
|----|--------|------|
| TD-016 | Regenerate the four screenshots on a Docker/Playwright-capable host and commit them | Next working session |
| — | Add a CI job to capture + upload screenshots on frontend PRs | Next FE sprint |

---

*End of UI Screenshots report.*
