import { type DeviceSignal } from '../status-signals';

/**
 * Device health source port (Phase 3, reserved).
 *
 * Provides device health for a room at a point in time, or `null` when unknown.
 * Abstract-class DI token. Device health is intentionally excluded from status
 * resolution; the Phase 10 device-monitoring context provides the implementation
 * for other consumers without affecting the status engine.
 */
export abstract class RoomDeviceSource {
  abstract getDeviceSignal(roomId: string, at: Date): Promise<DeviceSignal | null>;
}
