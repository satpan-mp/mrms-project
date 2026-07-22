import { type OverrideSignal } from '../status-signals';

/**
 * Override / emergency-lock source port (Phase 3, reserved).
 *
 * Provides an active manual override for a room at a point in time, or `null`
 * when none applies. Abstract-class DI token. Durable override persistence is a
 * future additive concern; the Phase 3 implementation reports no active override.
 */
export abstract class RoomOverrideSource {
  abstract getOverride(roomId: string, at: Date): Promise<OverrideSignal | null>;
}
