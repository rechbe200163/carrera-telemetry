// crash-detection/crash-detection.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { TrackReedEvent } from 'lib/events.types';

const HARD_TIMEOUT_MS = 3000;

interface OpenPassage {
  deviceId: string;
  sectorId: number;
  laneId: number;
  turnId: number;
  entryTs: number;
}

@Injectable()
export class CrashDetectionService {
  private readonly logger = new Logger(CrashDetectionService.name);

  // key: deviceId:sectorId:laneId:turnId -> OpenPassage
  private openPassages = new Map<string, OpenPassage>();

  constructor() {
    // private readonly sectorPassageRepo: SectorPassageRepository,
    // TODO: hier dein Prisma/Repository injecten
    // Watchdog für HardTimeouts
    setInterval(() => this.checkHardTimeouts(), 100);
  }

  private key(ev: {
    deviceId: string;
    sectorId: number;
    laneId: number;
    turnId: number;
  }): string {
    return `${ev.deviceId}:${ev.sectorId}:${ev.laneId}:${ev.turnId}`;
  }

  /**
   * Wird vom Controller aufgerufen mit dem MQTT-Payload
   */
  async handleTrackReedEvent(event: TrackReedEvent) {
    const ts = event.ts ?? Date.now();
    const key = this.key(event);
    const existing = this.openPassages.get(key);

    if (!event.isExit) {
      // ENTRY-EVENT
      if (existing) {
        // Double-Entry → der vorherige Durchlauf war ein Crash
        this.logger.warn(
          `Double entry detected for ${key}. Marking previous as crash (double_entry).`,
        );

        await this.savePassage({
          deviceId: existing.deviceId,
          sectorId: existing.sectorId,
          laneId: existing.laneId,
          turnId: existing.turnId,
          entryTs: existing.entryTs,
          exitTs: null,
          sectorTimeMs: null,
          label: 'crash',
          labelSource: 'double_entry',
        });
      }

      // neuen Durchlauf starten
      this.openPassages.set(key, {
        deviceId: event.deviceId,
        sectorId: event.sectorId,
        laneId: event.laneId,
        turnId: event.turnId,
        entryTs: ts,
      });

      return;
    }

    // EXIT-EVENT
    if (!existing) {
      this.logger.warn(
        `Exit without open passage for ${key} (ts=${ts}). Ignoring.`,
      );
      return;
    }

    const sectorTimeMs = ts - existing.entryTs;
    const isHardTimeout = sectorTimeMs > HARD_TIMEOUT_MS;

    await this.savePassage({
      deviceId: existing.deviceId,
      sectorId: existing.sectorId,
      laneId: existing.laneId,
      turnId: existing.turnId,
      entryTs: existing.entryTs,
      exitTs: ts,
      sectorTimeMs,
      label: isHardTimeout ? 'crash' : 'normal',
      labelSource: isHardTimeout ? 'hard_timeout' : 'normal',
    });

    this.openPassages.delete(key);
  }

  private async checkHardTimeouts() {
    const now = Date.now();

    for (const [key, passage] of this.openPassages.entries()) {
      const dt = now - passage.entryTs;
      if (dt > HARD_TIMEOUT_MS) {
        this.logger.warn(
          `Hard timeout for ${key}: dt=${dt}ms -> crash (hard_timeout)`,
        );

        await this.savePassage({
          deviceId: passage.deviceId,
          sectorId: passage.sectorId,
          laneId: passage.laneId,
          turnId: passage.turnId,
          entryTs: passage.entryTs,
          exitTs: null,
          sectorTimeMs: null,
          label: 'crash',
          labelSource: 'hard_timeout',
        });

        this.openPassages.delete(key);
      }
    }
  }

  private async savePassage(p: {
    deviceId: string;
    sectorId: number;
    laneId: number;
    turnId: number;
    entryTs: number;
    exitTs: number | null;
    sectorTimeMs: number | null;
    label: string; // 'normal' | 'crash'
    labelSource: string; // 'normal' | 'hard_timeout' | 'double_entry' | ...
  }) {
    // Hier später Prisma/Repo verwenden
    // await this.sectorPassageRepo.create({
    //   deviceId: p.deviceId,
    //   sectorId: p.sectorId,
    //   laneId: p.laneId,
    //   turnId: p.turnId,
    //   entryTs: new Date(p.entryTs),
    //   exitTs: p.exitTs ? new Date(p.exitTs) : null,
    //   sectorTimeMs: p.sectorTimeMs,
    //   label: p.label,
    //   labelSource: p.labelSource,
    // });

    this.logger.debug(`Saving passage: ${JSON.stringify(p)}`);
  }
}
