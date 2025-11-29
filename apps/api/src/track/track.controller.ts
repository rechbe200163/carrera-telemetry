// track.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Topics } from 'lib/mqtt.topics';
import { TrackReedEvent } from 'lib/events.types';
import { TrackService } from './track.service';

@Controller()
export class TrackController {
  private readonly logger = new Logger(TrackController.name);

  constructor(private readonly trackService: TrackService) {}

  @EventPattern(Topics.trackReedEvent())
  async handleTrackReedEvent(@Payload() data: TrackReedEvent) {
    this.logger.debug(`Received track reed event: ${JSON.stringify(data)}`);

    // 1) Welches Auto war das (zeitlich am nächsten)?
  }
}
