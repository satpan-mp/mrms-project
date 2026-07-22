import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { type RoomStatus } from '@prisma/client';

import { type DomainError, NotFoundError } from '../../../common/errors/domain-error';
import { OutboxWriter } from '../../../common/events/outbox-writer';
import { err, ok, type Result } from '../../../common/result/result';
import { Clock } from '../../../common/time/clock';
import { RoomRepository } from '../../catalog/domain/room.repository';

import { RoomMaintenanceSource } from './sources/maintenance.source';
import { RoomOccupancySource } from './sources/occupancy.source';
import { RoomOverrideSource } from './sources/override.source';
import { RoomScheduleSource } from './sources/schedule.source';
import {
  type RoomStatusChangedPayload,
  STATUS_EVENT_VERSION,
  StatusAggregateType,
  StatusEventType,
} from './status-events';
import { computeStatus } from './status-policy';

/**
 * Room Status Engine service (Phase 3).
 *
 * Transport-agnostic; returns `Result<T, DomainError>`. It is the sole write
 * authority for a room's status: it gathers signals from the source ports,
 * resolves the effective status via the pure `computeStatus`, and — only when the
 * value actually changes — persists it through the Room aggregate
 * (`RoomRepository.setStatus`) and emits `room.status.changed` in the SAME
 * transaction (atomic outbox). No transport/HTTP concerns; no persistence logic
 * beyond delegating to repositories/ports.
 *
 * Signals are gathered sequentially: inside an interactive transaction the
 * ambient Prisma client must not run concurrent queries.
 */
@Injectable()
export class RoomStatusService {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly schedule: RoomScheduleSource,
    private readonly occupancy: RoomOccupancySource,
    private readonly maintenance: RoomMaintenanceSource,
    private readonly override: RoomOverrideSource,
    private readonly outbox: OutboxWriter,
    private readonly clock: Clock,
  ) {}

  /** Recompute, persist (if changed), and emit the status for a single room. */
  @Transactional()
  async recomputeRoom(roomId: string): Promise<Result<RoomStatus, DomainError>> {
    return this.resolveAndApply(roomId);
  }

  /** Toggle maintenance on a room, then recompute/persist/emit its status. */
  @Transactional()
  async setMaintenance(roomId: string, active: boolean): Promise<Result<RoomStatus, DomainError>> {
    const room = await this.rooms.findById(roomId);
    if (!room) {
      return err(this.notFound(roomId));
    }
    await this.rooms.update(roomId, { maintenance: active });
    return this.resolveAndApply(roomId);
  }

  /**
   * Core resolution run inside the caller's transaction: read the room, gather
   * signals sequentially, compute the effective status, and persist + emit only
   * on an actual change. Validation (missing room) happens before any write.
   */
  private async resolveAndApply(roomId: string): Promise<Result<RoomStatus, DomainError>> {
    const room = await this.rooms.findById(roomId);
    if (!room) {
      return err(this.notFound(roomId));
    }

    const now = this.clock.now();
    const schedule = await this.schedule.getSchedule(roomId, now);
    const occupancy = await this.occupancy.getOccupancy(roomId, now);
    const maintenance = await this.maintenance.getMaintenance(roomId);
    const override = await this.override.getOverride(roomId, now);

    const decision = computeStatus({ now, schedule, occupancy, maintenance, override });
    const previousStatus = room.status;
    if (decision.status === previousStatus) {
      return ok(previousStatus);
    }

    await this.rooms.setStatus(roomId, decision.status, now);

    const payload = {
      roomId,
      previousStatus,
      currentStatus: decision.status,
      reason: decision.reason,
      source: decision.source,
      effectiveAt: now.toISOString(),
      meeting: decision.meeting
        ? {
            meetingCacheId: decision.meeting.meetingCacheId,
            startTime: decision.meeting.startTime.toISOString(),
            endTime: decision.meeting.endTime.toISOString(),
          }
        : null,
    } satisfies RoomStatusChangedPayload;

    await this.outbox.write({
      eventType: StatusEventType.RoomStatusChanged,
      eventVersion: STATUS_EVENT_VERSION,
      aggregateType: StatusAggregateType.Room,
      aggregateId: roomId,
      payload,
    });

    return ok(decision.status);
  }

  private notFound(roomId: string): NotFoundError {
    return new NotFoundError('status.room.not_found', `Room ${roomId} was not found.`, { roomId });
  }
}
