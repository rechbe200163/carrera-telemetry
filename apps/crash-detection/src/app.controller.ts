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
}
