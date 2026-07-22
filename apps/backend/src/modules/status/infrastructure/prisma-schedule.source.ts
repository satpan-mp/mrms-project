import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { BaseRepository } from '../../../common/persistence/base-repository';
import { RoomScheduleSource } from '../domain/sources/schedule.source';
import { RESERVED_HORIZON_MIN } from '../domain/status-config';
import { type ScheduleSignal } from '../domain/status-signals';

/**
 * Schedule source backed by the meeting-cache read model.
 *
 * Returns the room's non-cancelled meetings that are still relevant at `at`:
 * currently in progress or starting within the RESERVED horizon. Uses the
 * ambient (transaction-aware) client with an explicit `select`. `meeting_cache`
 * has no `deletedAt`, so cancellation is filtered explicitly.
 */
@Injectable()
export class PrismaScheduleSource extends BaseRepository implements RoomScheduleSource {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async getSchedule(roomId: string, at: Date): Promise<ScheduleSignal> {
    const horizonEnd = new Date(at.getTime() + RESERVED_HORIZON_MIN * 60_000);
    const rows = await this.client.meetingCache.findMany({
      where: {
        roomId,
        canceledAt: null,
        endTime: { gt: at },
        startTime: { lte: horizonEnd },
      },
      select: { id: true, startTime: true, endTime: true },
      orderBy: { startTime: 'asc' },
    });
    return {
      meetings: rows.map((row) => ({
        meetingCacheId: row.id,
        startTime: row.startTime,
        endTime: row.endTime,
      })),
    };
  }
}
