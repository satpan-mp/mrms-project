import type { ClientToServerEvents, ServerToClientEvents } from '@mrms/types';
import { io, type Socket } from 'socket.io-client';

export type MrmsSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface RealtimeClientOptions {
  /** WebSocket endpoint, e.g. `ws://localhost:3000/realtime`. */
  url: string;
  /** JWT (users/admin) OR device token (displays) provided on the handshake. */
  getAuthToken?: () => string | null | undefined;
  /** Whether the token is a room-scoped device token (kiosk) vs a user JWT. */
  authKind?: 'jwt' | 'device';
  /** Auto-connect on creation (default: false, so callers control lifecycle). */
  autoConnect?: boolean;
}

/**
 * Creates a typed Socket.IO client for MRMS realtime with resilient reconnect
 * (exponential backoff + jitter), matching the frontend realtime strategy
 * (Doc 15 §4). Event handlers and cache wiring are added by the RealtimeProvider
 * in each app during Sprint 1E; this factory provides the transport + contract.
 */
export function createRealtimeClient(options: RealtimeClientOptions): MrmsSocket {
  const socket: MrmsSocket = io(options.url, {
    path: '/realtime',
    transports: ['websocket'],
    autoConnect: options.autoConnect ?? false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    randomizationFactor: 0.5,
    auth: (cb) => {
      const token = options.getAuthToken?.() ?? null;
      cb(options.authKind === 'device' ? { deviceToken: token } : { token });
    },
  });
  return socket;
}

export * from './events';
