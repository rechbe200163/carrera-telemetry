// crash-detection/crash-detection.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TrackReedEvent } from 'lib/events.types';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from 'prisma/src/generated/client';

const HARD_TIMEOUT_MS = 5000;

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

  private openPassages = new Map<string, OpenPassage>();

  constructor(
    @Inject('PrismaServiceAuth')
    private prisma: CustomPrismaService<PrismaClient>, //
  ) {
    // private readonly sectorPassageRepo: SectorPassageRepository,
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

  private toCurveId(sectorId: number, turnId: number): string {
    return `${sectorId}:${turnId}`;
  }

  /**
   * Wird vom Controller aufgerufen mit dem MQTT-Payload
   */
  async handleTrackReedEvent(event: TrackReedEvent) {
    const ts = Date.now();
    const key = this.key(event);
    const existing = this.openPassages.get(key);

    if (!event.isExit) {
      // ENTRY
      if (existing) {
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

      this.openPassages.set(key, {
        deviceId: event.deviceId,
        sectorId: event.sectorId,
        laneId: event.laneId,
        turnId: event.turnId,
        entryTs: ts,
      });

      this.logger.debug(
        `Opened passage ${key} at ${ts}. Open count: ${this.openPassages.size}`,
      );
      return;
    }

    // EXIT
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
    this.logger.debug(
      `Closed passage ${key} with dt=${sectorTimeMs}ms (hard=${isHardTimeout}). Open count: ${this.openPassages.size}`,
    );
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
    await this.prisma.client.sector_passage.create({
      data: {
        ts: new Date(p.entryTs),
        lane: p.laneId,
        curve_id: this.toCurveId(p.sectorId, p.turnId),
        entry_ts: new Date(p.entryTs),
        exit_ts: p.exitTs ? new Date(p.exitTs) : null,
        sector_time_ms: p.sectorTimeMs,
        label: p.label,
        label_source: p.labelSource,
      },
    });

    this.logger.debug(`Saving passage: ${JSON.stringify(p)}`);
  }
}
