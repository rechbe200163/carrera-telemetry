import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  SESSION_FINISHED_EVENT,
  SESSION_RESULTS_READY_EVENT,
  SessionFinishedEvent,
  SessionResultsReadyEvent,
} from 'src/events/events';
import { SessionsRepo } from 'src/sessions/sessions.repo';
import { SessionResultsService } from './session-result.service';

@Injectable()
export class SessionResultsListener {
  private readonly logger = new Logger(SessionResultsListener.name);

  constructor(
    private readonly sessionResultsService: SessionResultsService,
    private readonly sessionsRepo: SessionsRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(SESSION_FINISHED_EVENT, { async: true })
  async handleSessionFinished(
    payload: SessionFinishedEvent,
  ): Promise<void> {
    const results =
      await this.sessionResultsService.calculateSessionResults(
        payload.sessionId,
      );

    const session =
      payload.meetingId == null
        ? await this.sessionsRepo.findById(payload.sessionId)
        : null;

    const meetingId = payload.meetingId ?? session?.meeting_id ?? null;

    const readyPayload: SessionResultsReadyEvent = {
      sessionId: payload.sessionId,
      meetingId,
      championshipId: null,
    };

    this.eventEmitter.emit(SESSION_RESULTS_READY_EVENT, readyPayload);
    this.logger.log(
      `Session ${payload.sessionId} results_ready emitted (${results.length} results)`,
    );
  }
}
