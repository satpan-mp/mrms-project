/**
 * Re-export the realtime event contracts from the shared types package so
 * consumers can import channel/event types directly from @mrms/realtime.
 */
export type {
  ServerToClientEvents,
  ClientToServerEvents,
  RealtimeChannel,
  RoomStatusEvent,
  RoomRefEvent,
  CalendarUpdatedEvent,
  RoomMaintenanceEvent,
  AnnouncementEvent,
  DeviceStatusEvent,
} from '@mrms/types';
