import { Injectable } from '@nestjs/common';

/**
 * Clock abstraction (frozen Phase 2 contract).
 *
 * Domain services and the outbox writer obtain "now" from an injected `Clock`
 * rather than calling `new Date()` directly, so time is deterministic and
 * testable (a fake clock is injected in unit tests). Bound as an abstract-class
 * DI token in `CommonModule`.
 */
export abstract class Clock {
  abstract now(): Date;
}

/** Production clock backed by the system wall clock. */
@Injectable()
export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
