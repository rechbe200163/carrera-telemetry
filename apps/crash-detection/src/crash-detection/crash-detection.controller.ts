import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CrashDetectionService } from './crash-detection.service';
import { CreateCrashDetectionDto } from './dto/create-crash-detection.dto';
import { UpdateCrashDetectionDto } from './dto/update-crash-detection.dto';
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
