/**
 * WebSocket (Socket.IO) event contracts (Doc 09 §4).
 * Typed maps consumed by @mrms/realtime and the backend NotificationModule so
 * the client and server never drift. Sprint 1A ships the contract only; the
 * gateway/handlers are implemented in Sprint 1E (P2).
 */
import type { DeviceStatus } from './enums';
import type { RoomStatus } from './enums';

/** Realtime channels (join rules enforced server-side, Doc 09 §4.1). */
export type RealtimeChannel =
  | `room:${string}`
  | `site:${string}`
  | 'global'
  | 'admin';

export interface RoomStatusEvent {
  roomId: string;
  status: RoomStatus;
  current: unknown | null;
  next: unknown | null;
}

export interface RoomRefEvent {
  roomId: string;
  eventId: string;
}

export interface CalendarUpdatedEvent {
  roomId: string;
}

export interface RoomMaintenanceEvent {
  roomId: string;
  maintenance: boolean;
}

export interface AnnouncementEvent {
  id: string;
  title: string;
  message: string;
  scope: 'GLOBAL' | 'SITE' | 'ROOM';
}

export interface DeviceStatusEvent {
  deviceId: string;
  status: DeviceStatus;
}

/** Server -> Client events (Doc 09 §4.2). */
export interface ServerToClientEvents {
  'room.status': (payload: RoomStatusEvent) => void;
  'meeting.started': (payload: RoomRefEvent) => void;
  'meeting.finished': (payload: RoomRefEvent) => void;
  'meeting.cancelled': (payload: RoomRefEvent) => void;
  'meeting.noshow': (payload: RoomRefEvent) => void;
  'calendar.updated': (payload: CalendarUpdatedEvent) => void;
  'room.maintenance': (payload: RoomMaintenanceEvent) => void;
  announcement: (payload: AnnouncementEvent) => void;
  'device.status': (payload: DeviceStatusEvent) => void;
}

/** Client -> Server events (Doc 09 §4.3). */
export interface ClientToServerEvents {
  subscribe: (payload: { roomId: string }) => void;
  resync: (payload: { roomId: string }) => void;
  ping: (payload: Record<string, never>) => void;
}
