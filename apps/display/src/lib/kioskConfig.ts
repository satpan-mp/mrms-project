/**
 * Kiosk configuration parsed from the display URL (Doc 15 §5). Each NUC opens a
 * URL like `?room=<roomId>&token=<deviceToken>`; exactly one Mini PC represents
 * one room. In Sprint 1E these values drive realtime subscription and the
 * device-token handshake. Sprint 1A parses and surfaces them.
 */
export interface KioskConfig {
  roomId: string | null;
  deviceToken: string | null;
}

export function readKioskConfig(search: string = window.location.search): KioskConfig {
  const params = new URLSearchParams(search);
  return {
    roomId: params.get('room'),
    deviceToken: params.get('token'),
  };
}
