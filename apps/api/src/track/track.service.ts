// track.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Sectors, TrackReedEvent } from 'lib/events.types';
import { LapTimes, SectorTimeUpdate, TrackUpdate } from 'lib/track-lap-result';

interface LapComputationState {
  lastStartFinish?: number;
  lastS1?: number;
  lastS2?: number;
  lapIndex: number;
}

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);
  private readonly stateByDevice = new Map<string, LapComputationState>();

  private getState(deviceId: string): LapComputationState {
    let state = this.stateByDevice.get(deviceId);
    if (!state) {
      state = { lapIndex: 0 };
      this.stateByDevice.set(deviceId, state);
    }
    return state;
  }

  handleTrackReedEvent(event: TrackReedEvent): TrackUpdate | null {
    const { deviceId, sectorId, ts } = event;
    const state = this.getState(deviceId);

    const update: TrackUpdate = {};

    switch (sectorId) {
      case Sectors.START_FINISH: {
        // 1) Wenn wir schon eine laufende Runde + S1 + S2 haben -> Runde ENDET hier (S3)
        if (
          state.lastStartFinish !== undefined &&
          state.lastS1 &&
          state.lastS2
        ) {
          const lapStartTs = state.lastStartFinish;
          const lapEndTs = ts;

          const sector1 = state.lastS1 - lapStartTs;
          const sector2 = state.lastS2 - state.lastS1;
          const sector3 = lapEndTs - state.lastS2;
          const lapTime = lapEndTs - lapStartTs;

          // Sektor-3-Update (direkt beim Crossing)
          const sectorUpdate: SectorTimeUpdate = {
            deviceId,
            lapIndex: state.lapIndex,
            sectorId: 3,
            sectorTimeMs: sector3,
            lapTimeSoFarMs: lapTime,
            lapStartTs,
            eventTs: ts,
          };
          update.sectorUpdate = sectorUpdate;

          const lapResult: LapTimes = {
            deviceId,
            lapIndex: state.lapIndex,
            lapStartTs,
            lapEndTs,
            sector1,
            sector2,
            sector3,
            lapTime,
          };
          update.lapCompleted = lapResult;

          this.logger.debug(
            `[${deviceId}] Lap ${state.lapIndex} completed at START_FINISH: ` +
              `S1=${sector1}ms, S2=${sector2}ms, S3=${sector3}ms, LAP=${lapTime}ms`,
          );

          // 2) Gleichzeitig: Start der NÄCHSTEN Runde
          state.lapIndex += 1;
          state.lastStartFinish = ts;
          state.lastS1 = undefined;
          state.lastS2 = undefined;
          this.stateByDevice.set(deviceId, state);
          return update;
        }

        // 3) Kein kompletter Satz an Sektoren -> nur Start setzen
        if (state.lastStartFinish === undefined) {
          this.logger.debug(
            `[${deviceId}] Initial START_FINISH at ${ts}, lapIndex=${state.lapIndex}`,
          );
        } else {
          this.logger.warn(
            `[${deviceId}] START_FINISH with incomplete sectors, starting new lap anyway.`,
          );
        }

        state.lastStartFinish = ts;
        state.lastS1 = undefined;
        state.lastS2 = undefined;
        this.stateByDevice.set(deviceId, state);
        return null;
      }

      case Sectors.SECTOR_1: {
        if (!state.lastStartFinish) {
          this.logger.warn(
            `[${deviceId}] SECTOR_1 received without START_FINISH, ignoring.`,
          );
          return null;
        }

        state.lastS1 = ts;

        const sectorTimeMs = state.lastS1 - state.lastStartFinish;
        const lapTimeSoFarMs = ts - state.lastStartFinish;

        const sectorUpdate: SectorTimeUpdate = {
          deviceId,
          lapIndex: state.lapIndex,
          sectorId: 1,
          sectorTimeMs,
          lapTimeSoFarMs,
          lapStartTs: state.lastStartFinish,
          eventTs: ts,
        };

        update.sectorUpdate = sectorUpdate;
        this.stateByDevice.set(deviceId, state);
        return update;
      }

      case Sectors.SECTOR_2: {
        if (!state.lastS1 || !state.lastStartFinish) {
          this.logger.warn(
            `[${deviceId}] SECTOR_2 received without SECTOR_1/START_FINISH, ignoring.`,
          );
          return null;
        }

        state.lastS2 = ts;

        const sectorTimeMs = state.lastS2 - state.lastS1;
        const lapTimeSoFarMs = ts - state.lastStartFinish;

        const sectorUpdate: SectorTimeUpdate = {
          deviceId,
          lapIndex: state.lapIndex,
          sectorId: 2,
          sectorTimeMs,
          lapTimeSoFarMs,
          lapStartTs: state.lastStartFinish,
          eventTs: ts,
        };

        update.sectorUpdate = sectorUpdate;
        this.stateByDevice.set(deviceId, state);
        return update;
      }

      default:
        this.logger.warn(
          `[${deviceId}] Unknown sectorId "${sectorId}" at ts=${ts}`,
        );
        return null;
    }
  }
}
