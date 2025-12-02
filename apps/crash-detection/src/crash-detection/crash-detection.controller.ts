import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CrashDetectionService } from './crash-detection.service';
import { TrackReedEvent } from 'lib/events.types';
import { Topics } from 'lib/mqtt.topics';

@Controller()
export class CrashDetectionController {
  constructor(private readonly crashDetectionService: CrashDetectionService) {}
  private readonly logger = new Logger(CrashDetectionController.name, {
    timestamp: true,
  });

  @EventPattern(Topics.trackReedEvent)
  async handleEntryTurnEvent(data: TrackReedEvent) {
    this.logger.debug(`Received entry turn event: ${JSON.stringify(data)}`);
    // Handle the entry turn event logic here
    await this.crashDetectionService.handleTrackReedEvent(data);
  }
}
