# Commit Convention (Conventional Commits)

All commits follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).
This enables clear history, automated changelogs, and semantic versioning.

## 1. Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type** (required): one of the types below.
- **scope** (optional): the affected module/area, e.g. `booking`, `sync`,
  `display`, `admin`, `auth`, `db`, `ci`.
- **subject** (required): imperative, present tense, lower case, no trailing
  period, <= ~70 chars ("add", not "added"/"adds").
- **body** (optional): what and why, wrapped at ~100 cols.
- **footer** (optional): issue refs (`Closes #123`) and breaking-change notes.

## 2. Types

| Type | Use for | SemVer effect |
|------|---------|---------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | none |
| `style` | Formatting, no code meaning change | none |
| `refactor` | Code change without feature/fix | none |
| `perf` | Performance improvement | PATCH |
| `test` | Add/correct tests | none |
| `build` | Build system / dependencies | none |
| `ci` | CI configuration | none |
| `chore` | Maintenance / tooling | none |

## 3. Breaking Changes

Indicate with `!` after type/scope and/or a `BREAKING CHANGE:` footer:

```
feat(api)!: change booking response shape

BREAKING CHANGE: `googleEventId` is now nested under `event`.
```

Breaking changes bump the MAJOR version (or MINOR while pre-1.0) and must be
documented in the CHANGELOG and the PR "Breaking Changes" section.

## 4. Examples

```
feat(booking): create Google Calendar event on booking
fix(sync): handle 410 invalid sync token with full resync
docs(standards): add logging convention
refactor(meetings): extract pure RoomStatusService
test(checkin): cover no-show grace expiry
ci: add docker-build workflow
chore: initialize MRMS project foundation
```

## 5. Rules

- One logical change per commit; do not mix unrelated changes.
- The subject must describe the change, not the file touched.
- Reference the issue in the footer when applicable.
- Commit messages are in English.
- Squash-merge PRs so the merged commit remains a clean Conventional Commit.
