# ADR-008: Why Clean Architecture + Domain-Driven Design

> **Purpose:** Record the overarching architectural style.
> **Scope:** Entire backend; informs frontend layering too.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Software Architecture](../04-Software-Architecture.md), [Backend Architecture](../16-Backend-Architecture.md), [Coding Standards](../standards/coding-standards.md), [Folder Convention](../standards/folder-convention.md)
> **References:** Evans (DDD); Martin (Clean Architecture)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team

## Context

MRMS spans several bounded contexts (Identity, Room Catalog, Reservation, Meeting
Lifecycle, Conferencing, Monitoring, Analytics, Notification). It must remain
maintainable, testable, and scalable, and must isolate volatile integrations
(Google Calendar) from core rules. The Master Brief mandates Clean Architecture,
DDD, SOLID, and the Repository Pattern.

## Problem

How do we structure the codebase so business rules stay independent of frameworks
and external services, and remain testable and evolvable?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Clean Architecture + DDD** | Framework-independent domain; testable use cases; clear module/bounded-context boundaries; ACL isolates Google; mandated | More layers/boilerplate; discipline required |
| Layered (controller-service-repository) only | Simpler, familiar | Business logic leaks into services tied to frameworks; weaker boundaries |
| Transaction Script / anemic | Fast to start | Poor long-term maintainability; rules scattered |

## Decision

Adopt **Clean Architecture + DDD**. Each module is layered
`domain -> application -> interface/infrastructure` with dependencies pointing
inward. The domain has zero framework imports; use cases depend on **ports**
(repository/gateway interfaces) implemented in infrastructure. An
**Anti-Corruption Layer** wraps Google Calendar so vendor shapes never reach the
domain. Room status is a pure domain service reused by REST, realtime, and the
no-show sweep.

## Consequences

- **Positive:** High testability (mock ports); framework/vendor isolation;
  consistent structure across modules; safe evolution; single authoritative
  status logic.
- **Negative / trade-offs:** More files/boilerplate; onboarding requires
  understanding the layering (documented in coding + folder conventions).
- **Neutral:** Maps cleanly onto NestJS modules (ADR-001).

## Future Considerations

New bounded contexts (e.g., visitor check-in, Teams integration from the roadmap)
are added as new modules following the same layering, without disturbing existing
domains.
