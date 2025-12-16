import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  MEETING_FINISHED_EVENT,
  SESSION_RESULTS_READY_EVENT,
  SessionResultsReadyEvent,
} from 'src/events/events';
import { MeetingsRepo } from './meetings.repo';

@Injectable()
export class MeetingStatusListener {
  private readonly logger = new Logger(MeetingStatusListener.name);

  constructor(
    private readonly meetingsRepo: MeetingsRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(SESSION_RESULTS_READY_EVENT, { async: true })
  async handleSessionResultsReady(
    payload: SessionResultsReadyEvent,
  ): Promise<void> {
    if (!payload.meetingId) {
      this.logger.warn(
        `session.results_ready without meetingId for session ${payload.sessionId}`,
      );
      return;
    }

    const res = await this.meetingsRepo.recomputeMeetingStatus(
      payload.meetingId,
    );

    if (res.changedToFinished) {
      this.eventEmitter.emit(MEETING_FINISHED_EVENT, {
        meetingId: res.meetingId,
        championshipId: res.championshipId,
        finishedAt: new Date(),
      });
      this.logger.log(
        `Meeting ${res.meetingId} finished -> meeting.finished emitted`,
      );
    }
  }
}
