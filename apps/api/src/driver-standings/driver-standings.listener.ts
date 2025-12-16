import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MEETING_FINISHED_EVENT,
  MeetingFinishedEvent,
} from 'src/events/events';
import { DriverStandingsRepo } from './driver-standings.repo';

@Injectable()
export class DriverStandingsListener {
  private readonly logger = new Logger(DriverStandingsListener.name);

  constructor(
    private readonly driverStandingsRepo: DriverStandingsRepo,
  ) {}

  @OnEvent(MEETING_FINISHED_EVENT, { async: true })
  async handleMeetingFinished(
    payload: MeetingFinishedEvent,
  ): Promise<void> {
    if (!payload.championshipId) {
      this.logger.debug(
        `meeting.finished without championshipId (meeting=${payload.meetingId})`,
      );
      return;
    }

    await this.driverStandingsRepo.recomputeStandingsForChampionship(
      payload.championshipId,
    );
    this.logger.log(
      `Driver standings recomputed for championship ${payload.championshipId}`,
    );
  }
}
