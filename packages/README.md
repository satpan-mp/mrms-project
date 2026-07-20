# packages/

Shared workspace packages consumed by the apps (see
`docs/15-Frontend-Architecture.md` and `docs/17-Folder-Structure.md`).

Planned packages:

| Package | Purpose |
|---------|---------|
| `ui` | `@mrms/ui` shared, theme-aware component library |
| `api-client` | Typed REST client generated from the backend OpenAPI spec |
| `realtime` | Socket.IO client + typed event contracts |
| `hooks` | Shared React Query hooks over `api-client` |
| `types` | Shared DTO / domain / enum types |
| `config` | Shared ESLint / tsconfig / Tailwind presets |

> Placeholder. Packages are scaffolded during Sprint 1+ as modules require them.
> No application logic exists yet - repository initialization only.
