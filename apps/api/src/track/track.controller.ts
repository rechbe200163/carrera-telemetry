// track.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TrackService } from './track.service';
import { Topics } from 'lib/mqtt.topics';
import { TrackReedEvent } from 'lib/events.types';

@Controller()
export class TrackController {
  private readonly logger = new Logger(TrackController.name);

  constructor(private readonly trackService: TrackService) {}

  @EventPattern(Topics.trackReedEvent())
  handleTrackReedEvent(@Payload() data: TrackReedEvent) {
    this.logger.debug(`Received track reed event: ${JSON.stringify(data)}`);

    const update = this.trackService.handleTrackReedEvent(data);
    if (!update) return;

    // 1) Sektor-Update -> soenfort ins Frontend push (z.B. Gateway)
    if (update.sectorUpdate) {
      const s = update.sectorUpdate;
      this.logger.log(
        `⏱️ [${s.deviceId}] Lap ${s.lapIndex} - Sector ${s.sectorId} = ${(
          s.sectorTimeMs / 1000
        ).toFixed(3)}s (Lap so far: ${(s.lapTimeSoFarMs / 1000).toFixed(3)}s)`,
      );

      // TODO: WebSocketGateway.notifySectorUpdate(s);
    }

    // 2) Lap fertig -> ans Frontend + in DB
    if (update.lapCompleted) {
      const l = update.lapCompleted;
      this.logger.log(
        `🏁 [${l.deviceId}] Lap ${l.lapIndex} completed: ` +
          `S1=${(l.sector1 / 1000).toFixed(3)}s, ` +
          `S2=${(l.sector2 / 1000).toFixed(3)}s, ` +
          `S3=${(l.sector3 / 1000).toFixed(3)}s, ` +
          `LAP=${(l.lapTime / 1000).toFixed(3)}s`,
      );

      // TODO: DB.persistLap(l);
      // TODO: WebSocketGateway.notifyLapCompleted(l);
    }
  }
}
