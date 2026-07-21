# @mrms/admin

React + TypeScript + Vite Admin Panel SPA for MRMS (central configuration,
monitoring, analytics). See `docs/15-Frontend-Architecture.md` and
`docs/14-Component-Hierarchy.md`.

## Sprint 1A (foundation)

Initial admin shell rendered per the approved Design System:

- Providers: Theme (light/dark), React Query, React Router.
- `@mrms/ui` AppShell + theme toggle; `@mrms/api-client` + `@mrms/hooks` for the
  live backend status card (health/version).
- Env loader (`src/config/env.ts`) for public Vite variables.
- Error boundary + loading/error states.

## Scripts

```bash
pnpm --filter @mrms/admin dev        # http://localhost:5173 (proxies /api, /realtime)
pnpm --filter @mrms/admin build
pnpm --filter @mrms/admin test
```

Rooms/devices/analytics pages arrive in Sprint 1C/1F and later (Doc 18).
