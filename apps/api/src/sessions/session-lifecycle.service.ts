import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  SESSION_FINISHED_EVENT,
  SessionFinishedEvent,
} from 'src/events/events';
import { SessionsRepo } from './sessions.repo';

@Injectable()
export class SessionLifecycleService {
  private readonly logger = new Logger(SessionLifecycleService.name);
  private readonly finishing = new Set<number>();
  private readonly finished = new Set<number>();

  constructor(
    private readonly sessionsRepo: SessionsRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Optional: Cleanup damit Sets nicht unendlich wachsen.
   * Aufrufen z.B. aus SessionRuntimeService.cleanup(sessionId).
   */
  clear(sessionId: number): void {
    this.finishing.delete(sessionId);
    this.finished.delete(sessionId);
  }

  async finishSessionLifeCycle(sessionId: number): Promise<void> {
    if (this.finished.has(sessionId) || this.finishing.has(sessionId)) {
      return;
    }

    this.finishing.add(sessionId);

    try {
      const session = await this.sessionsRepo.findById(sessionId);
      if (!session) {
        this.logger.warn(
          `finishSessionLifeCycle: session ${sessionId} not found`,
        );
        return;
      }

      const alreadyFinished = session.status === 'FINISHED';
      const updated = alreadyFinished
        ? session
        : await this.sessionsRepo.finishSession(sessionId);

      const payload: SessionFinishedEvent = {
        sessionId,
        meetingId: updated.meeting_id ?? null,
        sessionType: updated.session_type ?? null,
        finishedAt: updated.end_time ?? new Date(),
      };

      this.finished.add(sessionId);
      this.eventEmitter.emit(SESSION_FINISHED_EVENT, payload);
    } catch (err) {
      this.logger.error(
        `finishSessionLifeCycle(${sessionId}) failed`,
        err as any,
      );
      throw err;
    } finally {
      this.finishing.delete(sessionId);
    }
  }
}
