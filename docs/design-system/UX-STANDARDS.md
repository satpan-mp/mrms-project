# UX Standards

> **Purpose:** Interaction rules for MRMS key flows - booking, check-in, Google Meet launch, error handling, offline mode, reconnection, loading experience, notifications.
> **Scope:** Display and Admin SPAs.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design System](./DESIGN-SYSTEM.md), [Component Standards](./COMPONENT-STANDARDS.md), [Dashboard Standards](./DASHBOARD-STANDARDS.md), [Accessibility](./ACCESSIBILITY.md), [PRD](../01-PRD-Product-Requirement-Document.md), [Google Integration guide](../guides/)
> **References:** UI/UX Pro Max (ux domain: loading, error clarity, focus management)

Principles: give immediate feedback (< 100ms perceived), keep the user informed,
prevent errors before they happen, make every error recoverable, never leave a dead
end. Optimistic UI where safe, with clear rollback on failure.

---

## 1. Booking

- **Entry:** from a Room Card ("Book"), the timeline (free slot), or a "New booking"
  action. Pre-fill room + slot when started from context.
- **Form:** room, date, start/end (or duration), title, organizer, participants,
  optional "add Google Meet". Inline validation on blur; disable Confirm until valid;
  show the room's conflicting bookings inline.
- **Conflicts:** check availability before submit; on conflict, explain and suggest
  the nearest free slots rather than a bare rejection.
- **Feedback:** Confirm → optimistic pending state → success toast + updated
  timeline; on failure roll back and explain. Summarize what was booked (room, time,
  Meet link if created).
- **Editing/cancel:** allow edit/cancel with an AlertDialog confirm for destructive
  cancel; released time returns to the timeline.
- Times display in the venue timezone; use 24h or locale format consistently.

---

## 2. Check-In

- **Purpose:** confirm a booked meeting is actually used; drives no-show release.
- **Window:** check-in opens a set interval before start and stays open a grace
  period after (per PRD). Show a clear countdown ("Check in within 9:32").
- **Action:** one large, obvious primary control (Admin, or room-side flow per PRD).
  On success → status → Occupied, confirmation feedback.
- **No-show:** if not checked in by the grace deadline, auto-release the room (status
  → Available), notify the organizer, and free the slot. Communicate the pending
  release beforehand ("Auto-release in 2:00 unless checked in").
- On the Display, reflect check-in/occupied changes promptly (fade ≤ 200ms).

---

## 3. Google Meet Launch

- **Create:** when "add Meet" is chosen, create the conference on the linked Google
  Calendar event; show a loading state while provisioning; on success surface the
  join link with **copy** and **open** actions.
- **Join:** "Join" opens Meet in a new tab (`rel="noopener"`); never block the UI
  waiting on the external app. Provide the raw link as fallback.
- **Failure:** if creation fails (auth/quota/API), keep the booking, show a clear
  error with **Retry**, and allow adding Meet later - the booking is never lost
  because Meet failed. See [Google Integration guide](../guides/).
- Show meeting/account context so users launch the right conference.

---

## 4. Error Handling

- **Voice:** plain language, blame-free, actionable. Say what happened, why (if
  useful), and the next step. No raw codes/stack traces to end users (log those).
- **Placement:** field-level for validation (inline, `role="alert"`); section/page
  for load failures (with Retry); toast for transient action failures; AlertDialog
  only for blocking decisions.
- **Always recoverable:** every error offers a way forward (retry, edit, go back,
  contact). Distinguish user-fixable (validation) from system issues (network/server).
- Preserve user input on error - never clear a form the user must re-fill.

---

## 5. Offline Mode

- **Detect** connectivity loss (network events + failed heartbeats/requests).
- **Display Client:** keep showing the **last known** schedule/status with a clear,
  non-alarming "Offline - showing last update HH:MM:SS" banner; dim or mark data as
  stale after a threshold; never blank the screen. Continue local clock.
- **Admin:** show a persistent offline indicator; disable actions that require the
  server (or queue where safe) and clearly mark them unavailable; avoid silent
  failures.
- Do not lose in-progress input; hold and retry on reconnect where safe.

---

## 6. Reconnection

- **Auto-retry** with exponential backoff + jitter; show subtle "Reconnecting…"
  status (not a blocking spinner).
- **On reconnect:** re-sync state, replace stale data, update "last synced", and show
  a brief success confirmation ("Back online"). Reconcile any queued actions and
  report per-item results (applied vs. conflicted).
- Display Client resumes live updates automatically and clears the offline banner.
- Avoid thundering-herd: jittered backoff across many displays.

---

## 7. Loading Experience

- **Perceived performance:** skeletons matching final layout for initial/section
  loads (not full-page spinners); inline spinner + `aria-busy` for button/row
  actions; keep layout stable (no shift on content arrival).
- **Thresholds:** instant (< 100ms) no indicator; show skeleton/spinner only if the
  wait exceeds ~300ms to avoid fl/flash; for long tasks show progress or a reassuring
  message.
- **Optimistic UI** for low-risk mutations (booking pending state) with rollback on
  failure.
- Respect `prefers-reduced-motion` (no shimmer if reduced). Display Client shows a
  branded first-load state, then live content.

---

## 8. Notifications

- **Channels:** in-app **toast** (transient), inline **banners** (persistent
  context, e.g., offline), and system/email/Google notifications per PRD (e.g.,
  no-show, booking confirmations) - out of the UI layer but reflected in-app.
- **Severity → token/icon:** success (green/check), info (blue), warning (amber),
  error (red). Never color-only.
- **Toast rules:** bottom-right (Admin), auto-dismiss 4-6s (errors persist), pause on
  hover/focus, max 3 stacked, dismissible; announced via `aria-live` (`polite`
  normal / `assertive` critical). See [Component Standards §9](./COMPONENT-STANDARDS.md).
- **Don't over-notify:** batch/summarize; reserve `assertive`/modal for the truly
  urgent (e.g., a device went offline, imminent auto-release). Display Client shows
  operational notices in its footer/announcement band, not popups.

---

## Definition of Done (per flow)

- [ ] Immediate feedback; informed waiting (skeleton/progress); stable layout
- [ ] Every error is plain-language and recoverable; input preserved
- [ ] Offline + reconnection behavior defined and non-destructive
- [ ] Keyboard-complete; focus managed; `aria-live` for async outcomes
- [ ] Not color-only; both themes; reduced-motion respected
