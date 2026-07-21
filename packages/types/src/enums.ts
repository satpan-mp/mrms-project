/**
 * Domain enums shared across MRMS apps and the backend contract.
 *
 * These mirror the Prisma enums in the approved Database Schema (Doc 08). They
 * are declared as `const` objects + union types (not TS `enum`) so they are
 * safe to consume in both the browser bundles and the Node backend without
 * runtime/`isolatedModules` pitfalls.
 */

export const RoomStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  STARTING_SOON: 'STARTING_SOON',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
} as const;
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const UserRole = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  EMPLOYEE: 'EMPLOYEE',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const DeviceStatus = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  DEGRADED: 'DEGRADED',
  UNKNOWN: 'UNKNOWN',
} as const;
export type DeviceStatus = (typeof DeviceStatus)[keyof typeof DeviceStatus];

export const CheckInState = {
  PENDING: 'PENDING',
  CHECKED_IN: 'CHECKED_IN',
  NO_SHOW: 'NO_SHOW',
  RELEASED: 'RELEASED',
} as const;
export type CheckInState = (typeof CheckInState)[keyof typeof CheckInState];

export const LogType = {
  SYSTEM: 'SYSTEM',
  ACTIVITY: 'ACTIVITY',
  AUDIT: 'AUDIT',
} as const;
export type LogType = (typeof LogType)[keyof typeof LogType];
