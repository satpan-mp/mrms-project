import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { type CheckInState } from '@prisma/client';

import { BaseRepository } from '../../../common/persistence/base-repository';
import { RoomOccupancySource } from '../domain/sources/occupancy.source';
import { type OccupancySignal, OccupancyState } from '../domain/status-signals';

/**
 * Occupancy source backed by the check-in read model.
 *
 * Resolves the check-in disposition of the room's currently in-progress meeting.
 * If no meeting is in progress, or the meeting has no check-in record yet, the
 * disposition is neutral (`None`) so the resolver keeps the room OCCUPIED for an
 * in-progress meeting. The authoritative check-in semantics arrive in Phase 9;
 * this reads whatever `check_ins` currently holds.
 */
@Injectable()
export class PrismaOccupancySource extends BaseRepository implements RoomOccupancySource {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async getOccupancy(roomId: string, at: Date): Promise<OccupancySignal> {
    const meeting = await this.client.meetingCache.findFirst({
      where: { roomId, canceledAt: null, startTime: { lte: at }, endTime: { gt: at } },
      select: { id: true },
      orderBy: { startTime: 'asc' },
    });
    if (!meeting) {
      return { meetingCacheId: null, state: OccupancyState.None };
    }

    const checkIn = await this.client.checkIn.findUnique({
      where: { meetingCacheId: meeting.id },
      select: { state: true },
    });
    return { meetingCacheId: meeting.id, state: this.mapState(checkIn?.state) };
  }

  private mapState(state: CheckInState | undefined): OccupancyState {
    switch (state) {
      case 'CHECKED_IN':
        return OccupancyState.CheckedIn;
      case 'PENDING':
        return OccupancyState.Pending;
      case 'NO_SHOW':
        return OccupancyState.NoShow;
      case 'RELEASED':
        return OccupancyState.Released;
      default:
        return OccupancyState.None;
    }
  }
}
