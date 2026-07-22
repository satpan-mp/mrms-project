import { Injectable } from '@nestjs/common';

import { RoomOverrideSource } from '../domain/sources/override.source';
import { type OverrideSignal } from '../domain/status-signals';

/**
 * Phase 3 override source: reports no active override.
 *
 * Durable manual override / emergency-lock persistence is a future additive
 * concern; binding this no-op keeps the resolver's override precedence wired and
 * lets a real implementation replace it later without any engine change.
 */
@Injectable()
export class NoopOverrideSource implements RoomOverrideSource {
  async getOverride(): Promise<OverrideSignal | null> {
    return null;
  }
}
