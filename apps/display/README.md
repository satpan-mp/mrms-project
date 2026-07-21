# @mrms/display

React + TypeScript + Vite kiosk Display SPA for MRMS: a room-specific,
fullscreen, TV-optimized display driven by realtime updates. See
`docs/15-Frontend-Architecture.md` and `docs/13-UIUX-Wireframe.md`.

## Sprint 1A (foundation)

Fullscreen kiosk shell rendered per the Design System (dark by default to reduce
TV glare/burn-in, zero-interaction):

- Header band (brand + room identity + local realtime clock).
- Footer backend connection indicator (never blanks; degrades gracefully).
- Kiosk config parsing (`?room=<id>&token=<deviceToken>` per Doc 12 §3).
- Providers: Theme (dark) + React Query. Error boundary + local clock (network-
  independent, NFR-PERF-4).

## Scripts

```bash
pnpm --filter @mrms/display dev      # http://localhost:5174 (proxies /api, /realtime)
pnpm --filter @mrms/display build
pnpm --filter @mrms/display test
```

Live room status banner, current/next meeting, today's schedule, and realtime
binding are implemented in Sprint 1E (P2).
