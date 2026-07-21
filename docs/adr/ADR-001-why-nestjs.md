# ADR-001: Why NestJS for the backend

> **Purpose:** Record the choice of NestJS as the backend framework.
> **Scope:** Backend API, WebSocket gateway, workers.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Backend Architecture](../16-Backend-Architecture.md), [Software Architecture](../04-Software-Architecture.md), [ADR-008](./ADR-008-clean-architecture-ddd.md)
> **References:** [NestJS docs](https://docs.nestjs.com/)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team

## Context

MRMS requires a modular backend exposing both a REST API and a WebSocket gateway,
with background workers for calendar sync and no-show sweeps. The Master Brief
mandates a Node.js/NestJS stack, Clean Architecture, DDD, SOLID, and the
Repository Pattern.

## Problem

Which backend framework best supports a modular, testable, real-time,
enterprise-grade Node.js application aligned with the mandated architecture?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **NestJS** | First-class DI, modules, guards/interceptors, native WebSocket + microservices, TypeScript-first, opinionated structure that maps cleanly to Clean Architecture/DDD | Learning curve; some boilerplate |
| Express (bare) | Minimal, flexible, ubiquitous | No structure/DI out of the box; teams reinvent modularity; harder to enforce boundaries |
| Fastify (bare) | Very fast, schema validation | Same structural gaps as Express; smaller ecosystem for enterprise patterns |
| AdonisJS | Batteries-included, MVC | Smaller community; less alignment with DDD/ports-and-adapters |

## Decision

Adopt **NestJS**. Its module system, dependency injection, and built-in support
for HTTP controllers, Socket.IO gateways, guards (RBAC), interceptors (logging,
audit), and queue processors map directly onto the Clean Architecture layering in
ADR-008. It is explicitly required by the Master Brief and gives the team a
consistent, testable structure across API, gateway, and workers.

## Consequences

- **Positive:** Clear module boundaries; DI enables port/adapter testing;
  integrated WebSocket + queue support; strong TypeScript typing; large ecosystem.
- **Negative / trade-offs:** More boilerplate than bare Express; team must follow
  Nest idioms; framework coupling confined to the interface/infrastructure layers.
- **Neutral:** Runs on Node 20 (LTS) inside Docker like any Node service.

## Future Considerations

Revisit only if we need a non-Node runtime for the backend, or if NestJS overhead
becomes a measured bottleneck (not anticipated at MRMS scale of ~100+ rooms).
