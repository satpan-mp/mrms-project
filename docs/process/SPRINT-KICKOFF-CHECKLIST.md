# Sprint Kickoff Checklist (Reusable)

> **Purpose:** Gate that every Sprint must satisfy **before** implementation begins.
> **Scope:** All sprints from Sprint 1B onward.
> **Version:** 1.0
> **Author:** MRMS Engineering - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related:** [Sprint 1B Engineering Rules](./SPRINT-1B-ENGINEERING-RULES.md), [Definition of Ready](./definition-of-ready.md), [Definition of Done](./definition-of-done.md)

Copy this checklist into the sprint's kickoff issue/PR and confirm every item.

## Planning
- [ ] Roadmap updated (Docs 18/19) for this sprint's scope
- [ ] Sprint goal + scope explicitly defined (in/out of scope)
- [ ] Acceptance criteria complete for every planned story

## Architecture & decisions
- [ ] Relevant ADRs reviewed; new decisions captured as new ADRs before coding
- [ ] No cross-layer dependency or architecture change without an ADR
- [ ] API contract approved (endpoints, DTOs, error envelope, examples)

## Data
- [ ] Migrations planned (schema changes, rollback strategy, backward compatibility)
- [ ] Seed/data impact assessed

## Quality & risk
- [ ] Test strategy defined (unit / integration / e2e; coverage targets for new code)
- [ ] Security review scope defined (authn/authz, validation, rate limiting, secrets, OWASP)
- [ ] Performance considerations noted (queries, bundle, caching, memory, startup)
- [ ] Rollback strategy defined for the sprint's changes

## Hygiene
- [ ] Technical debt register reviewed; blocking debt scheduled or resolved
- [ ] Dependencies frozen (no opportunistic upgrades mid-sprint; batch separately)
- [ ] Branch protection + CI green required for every PR

## Sign-off
- [ ] Engineering lead approves kickoff
- [ ] Product owner confirms acceptance criteria

A sprint may begin only when every box is checked.
