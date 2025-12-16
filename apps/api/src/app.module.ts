import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DriversModule } from './drivers/drivers.module';
import { ControllersModule } from './controllers/controllers.module';
import { ChampionshipsModule } from './championships/championships.module';
import { MeetingsModule } from './meetings/meetings.module';
import { SessionsModule } from './sessions/sessions.module';
import { MqttModule } from './mqtt/mqtt.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { LapsModule } from './laps/laps.module';
import { SessionEntryModule } from './session-entry/session-entry.module';
import { SessionResultModule } from './session-result/session-result.module';
import { DriverStandingsModule } from './driver-standings/driver-standings.module';
import { LiveModule } from './live/live.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // macht process.env überall verfügbar
    }),
    EventEmitterModule.forRoot(),
    DriversModule,
    ControllersModule,
    ChampionshipsModule,
    MeetingsModule,
    SessionsModule,
    MqttModule,
    TelemetryModule,
    LapsModule,
    SessionEntryModule,
    SessionResultModule,
    DriverStandingsModule,
    LiveModule,
    StatisticsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
