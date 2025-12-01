import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';
import { Topics } from 'lib/mqtt.topics';
import { Logger } from '@nestjs/common';
import { TrackReedEvent } from 'lib/events.types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(AppController.name, { timestamp: true });

  @Get('health')
  health(): number {
    return this.appService.health();
  }

  @EventPattern(Topics.entryTurnEvent())
  async handleEntryTurnEvent(data: TrackReedEvent) {
    this.logger.debug(`Received entry turn event: ${JSON.stringify(data)}`);
    // Handle the entry turn event logic here
  }

  @EventPattern(Topics.exitTurnEvent())
  async handleExitTurnEvent(data: any) {
    this.logger.debug(`Received exit turn event: ${JSON.stringify(data)}`);
  }
}
