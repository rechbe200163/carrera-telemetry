import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  SESSION_FINISHED_EVENT,
  SessionFinishedEvent,
} from 'src/events/events';
import { MqttService } from './mqtt.service';

@Injectable()
export class SessionMqttListener {
  private readonly logger = new Logger(SessionMqttListener.name);

  constructor(private readonly mqtt: MqttService) {}

  @OnEvent(SESSION_FINISHED_EVENT, { async: true })
  async handleSessionFinished(
    payload: SessionFinishedEvent,
  ): Promise<void> {
    await this.mqtt.publish('race_control/sessions/stop', {
      sessionId: payload.sessionId,
    });
    this.logger.log(
      `Published race_control/sessions/stop for session ${payload.sessionId}`,
    );
  }
}
