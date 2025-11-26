import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttModule } from './mqtt/mqtt.module';
import { CarTelemetryModule } from './car-telemetry/car-telemetry.module';
import { TrackModule } from './track/track.module';

@Module({
  imports: [MqttModule, CarTelemetryModule, TrackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
