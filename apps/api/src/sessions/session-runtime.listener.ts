import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  SESSION_FINISHED_EVENT,
  SessionFinishedEvent,
} from 'src/events/events';
import { SessionRuntimeService } from './session-runtime.service';
import { SessionsEventsService } from './sessions-events.service';

@Injectable()
export class SessionRuntimeListener {
  private readonly logger = new Logger(SessionRuntimeListener.name);

  constructor(
    private readonly runtime: SessionRuntimeService,
    private readonly events: SessionsEventsService,
  ) {}

  @OnEvent(SESSION_FINISHED_EVENT, { async: true })
  async handleSessionFinished(payload: SessionFinishedEvent): Promise<void> {
    await this.runtime.cleanup(payload.sessionId);
    this.logger.log(`Session ${payload.sessionId} runtime cleaned up`);
    this.events.emit({
      type: 'session_stop',
      payload: {
        sessionId: payload.sessionId,
        reason: 'finished',
        stoppedAt: payload.finishedAt.toISOString(),
      },
    });
  }
}
