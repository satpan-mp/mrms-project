import { type Facility, type Room, type RoomStatus } from '@prisma/client';

import { type Page } from '../../../common/pagination/page';
import { type PageRequest } from '../../../common/pagination/page-request';

import { type FindByIdOptions } from './site.repository';

/** Fields a `Room` list may be sorted by (allow-list; deterministic order appends id). */
export const ROOM_SORTABLE_FIELDS = ['name', 'capacity', 'status', 'createdAt'] as const;

/** A room together with its resolved facilities (Room aggregate view). */
export type RoomWithFacilities = Room & { readonly facilities: Facility[] };

export interface CreateRoomInput {
  readonly siteId: string;
  readonly organizationId: string;
  readonly name: string;
  readonly capacity?: number;
  readonly location?: string | null;
  readonly displayUrl?: string | null;
  readonly photoUrl?: string | null;
  readonly calendarProviderId?: string | null;
  readonly externalResourceId?: string | null;
  readonly active?: boolean;
}

export interface UpdateRoomInput {
  readonly name?: string;
  readonly capacity?: number;
  readonly location?: string | null;
  readonly displayUrl?: string | null;
  readonly photoUrl?: string | null;
  readonly calendarProviderId?: string | null;
  readonly externalResourceId?: string | null;
  readonly active?: boolean;
  readonly maintenance?: boolean;
}

export interface RoomFilter {
  readonly siteId?: string;
  readonly organizationId?: string;
  readonly status?: RoomStatus;
  readonly active?: boolean;
  /** Case-insensitive match against name/location. */
  readonly search?: string;
}

/**
 * Room repository port (Room aggregate; owns the RoomFacility link table).
 *
 * The aggregate root is `Room`; facility links are managed through this port
 * (`setFacilities`) rather than a standalone RoomFacility repository. Reads are
 * active-only by default; writes use the ambient transaction.
 */
export abstract class RoomRepository {
  abstract findById(id: string, options?: FindByIdOptions): Promise<Room | null>;

  /** Fetch a room with its facilities resolved (single query, no N+1). */
  abstract findWithFacilities(id: string): Promise<RoomWithFacilities | null>;

  /** Uniqueness lookup for the optional `displayUrl` natural key. */
  abstract findByDisplayUrl(displayUrl: string): Promise<Room | null>;

  abstract list(filter: RoomFilter, page: PageRequest): Promise<Page<Room>>;

  abstract create(input: CreateRoomInput): Promise<Room>;

  abstract update(id: string, input: UpdateRoomInput): Promise<Room>;

  /** Soft delete (sets deletedAt); shallow, non-cascading (links are left intact). */
  abstract softDelete(id: string): Promise<void>;

  /** Replace the room's facility links with exactly the given set (within the tx). */
  abstract setFacilities(roomId: string, facilityIds: readonly string[]): Promise<void>;

  /**
   * Persist the room's status and status-change timestamp only. The write
   * authority for status belongs to the Phase 3 Status Engine, but the mutation
   * stays within the Room aggregate. Mechanical: no validation, no events.
   */
  abstract setStatus(roomId: string, status: RoomStatus, statusChangedAt: Date): Promise<void>;
}
