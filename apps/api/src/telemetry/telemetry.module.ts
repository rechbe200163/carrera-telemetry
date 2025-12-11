import { Module } from '@nestjs/common';
import { LapEventsConsumer } from './lap-events.consumer';
import { SessionsModule } from 'src/sessions/sessions.module';
import { LapsModule } from 'src/laps/laps.module';
import { SessionEntryModule } from 'src/session-entry/session-entry.module';
import { MqttService } from 'src/mqtt/mqtt.service';

@Module({
  imports: [SessionsModule, LapsModule, SessionEntryModule],
  providers: [MqttService, LapEventsConsumer],
})
export class TelemetryModule {}
