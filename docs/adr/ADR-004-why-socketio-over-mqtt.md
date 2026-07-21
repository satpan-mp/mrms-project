# ADR-004: Why Socket.IO instead of MQTT for realtime

> **Purpose:** Record the realtime transport choice.
> **Scope:** Server -> client realtime updates (display + admin) and scale-out.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [API Specification](../09-API-Specification.md), [Backend Architecture](../16-Backend-Architecture.md), [High-Level Architecture](../06-High-Level-Architecture-Diagram.md)
> **References:** [Socket.IO docs](https://socket.io/docs/v4/), [MQTT](https://mqtt.org/)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team

## Context

Displays must update instantly (status, meetings, announcements) without refresh.
The Master Brief specifies WebSocket (Socket.IO). Clients are browsers in Chrome
Kiosk; the backend is NestJS with a Redis instance already present for cache/queue.

## Problem

Which realtime transport best fits browser clients, the mandated WebSocket
approach, and our NestJS + Redis stack?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Socket.IO (WebSocket)** | Browser-native, auto-reconnect, rooms/namespaces, first-class NestJS gateway, Redis adapter for horizontal scale-out, fallbacks | Slightly heavier protocol than raw WS |
| Raw WebSocket (ws) | Lean | No rooms/reconnect/scale-out out of the box; reinvent Socket.IO features |
| MQTT | Great for IoT fan-out, lightweight pub/sub | Not browser-native (needs MQTT-over-WS + broker like Mosquitto/EMQX); extra infra; overkill for our room-scoped browser fan-out; weaker request/ack ergonomics for our use |
| Server-Sent Events | Simple one-way | One-way only; we want client->server events (subscribe/resync) and richer channels |

## Decision

Adopt **Socket.IO over WebSocket**. It is browser-native, gives us channels
(`room:{id}`, `site:{id}`, `global`, `admin`), automatic reconnection with
resync, and a **Redis adapter** for multi-instance fan-out reusing the Redis we
already run. MQTT would add a broker and a non-native browser path for no benefit
at our scale and topology.

## Consequences

- **Positive:** Minimal new infra (reuse Redis); robust reconnect (critical for
  24/7 kiosks); clean channel scoping; native NestJS support.
- **Negative / trade-offs:** Socket.IO framing is proprietary (mitigated by using
  official clients in `@mrms/realtime`).
- **Neutral:** Nginx must be configured for WS upgrade (already done).

## Future Considerations

If we later add many IoT occupancy sensors (roadmap), MQTT could complement
Socket.IO for the sensor ingestion path specifically, without replacing the
browser realtime transport.
