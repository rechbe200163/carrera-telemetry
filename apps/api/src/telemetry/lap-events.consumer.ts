import { Injectable, OnModuleInit } from '@nestjs/common';
import { LapsRepo } from 'src/laps/laps.repo';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionRuntimeService } from 'src/sessions/session-runtime.service';
import { SessionsRepo } from 'src/sessions/sessions.repo';

type BasePayload = {
  eventType?: 'lap' | 'sector';
  sessionId: number;
  controllerAddress: number;
  lapNumber: number;
  cuTimestampMs: number;
  wallClockTs: number;
};

type LapPayload = BasePayload & {
  eventType?: 'lap';
  lapTimeMs: number;
  sectorTimes: {
    s1: number;
    s2: number;
  };
};

type SectorPayload = BasePayload & {
  eventType: 'sector';
  sectorNumber: 1 | 2;
  sectorTimeMs: number;
};

type Payload = LapPayload | SectorPayload;

@Injectable()
export class LapEventsConsumer implements OnModuleInit {
  private activeSessionId: number | null = null;
  private controllerMap = new Map<number, number>(); // controllerAddress -> driverId

  constructor(
    private readonly mqtt: MqttService,
    private readonly sessionsRepo: SessionsRepo,
    private readonly lapsRepo: LapsRepo,
    private readonly sessionRuntime: SessionRuntimeService,
  ) {}

  onModuleInit() {
    // 1) Lap-/Sector-Events
    this.mqtt.subscribe('carrera/cu/lapTimes', (payload: Payload) => {
      this.handleLapEvent(payload).catch(console.error);
    });

    // 2) Session-Start-Events
    this.mqtt.subscribe('race_control/sessions/start', (payload) => {
      this.handleSessionStartEvent(payload).catch(console.error);
    });

    // 3) Session-Stop-Events
    this.mqtt.subscribe('race_control/sessions/stop', (payload) => {
      this.handleSessionStopEvent(payload).catch(console.error);
    });

    console.log('LapEventsConsumer initialized');
  }

  private async handleSessionStartEvent(payload: any) {
    const sessionId = payload.sessionId as number | null;

    if (!sessionId) {
      this.activeSessionId = null;
      this.controllerMap.clear();
      return;
    }

    this.activeSessionId = sessionId;
    this.controllerMap.clear();

    const session = await this.sessionsRepo.listEntriesForSession(sessionId);
    if (!session?.session_entries) return;

    for (const e of session.session_entries) {
      this.controllerMap.set(e.controller_address, e.driver_id);
    }
  }

  private async handleSessionStopEvent(payload: any) {
    const sessionId = payload.sessionId as number | null;
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
      this.controllerMap.clear();
    }
  }

  private async handleLapEvent(payload: Payload) {
    // Sicherheitsgurt: Session mismatch ignorieren
    if (!this.activeSessionId) return;
    if (payload.sessionId !== this.activeSessionId) return;

    const driverId = this.controllerMap.get(payload.controllerAddress);
    if (!driverId) return;

    const eventType: 'lap' | 'sector' = payload.eventType ?? 'lap';

    console.log(eventType);

    // ---------------- SECTOR-Event -> nur Live-Update ----------------
    if (eventType === 'sector') {
      const sectorPayload = payload as SectorPayload;

      await this.sessionRuntime.onSectorUpdate({
        sessionId: this.activeSessionId,
        driverId,
        controllerAddress: sectorPayload.controllerAddress,
        lapNumber: sectorPayload.lapNumber,
        sectorNumber: sectorPayload.sectorNumber,
        sectorTimeMs: sectorPayload.sectorTimeMs,
        wallClockTs: sectorPayload.wallClockTs,
      });

      return;
    }

    // ---------------- LAP-Event -> DB + Runtime ----------------
    if (eventType === 'lap') {
      const lapPayload = payload as LapPayload;

      if (
        !this.sessionRuntime.shouldAcceptLap({
          sessionId: this.activeSessionId,
          driverId,
          lapNumber: lapPayload.lapNumber,
        })
      ) {
        return;
      }

      await this.lapsRepo.create({
        session_id: this.activeSessionId,
        driver_id: driverId,
        lap_number: lapPayload.lapNumber,
        date_start: new Date(lapPayload.wallClockTs),
        lap_duration_ms: lapPayload.lapTimeMs,
        duration_sector1: lapPayload.sectorTimes?.s1 ?? null,
        duration_sector2: lapPayload.sectorTimes?.s2 ?? null,
        duration_sector3: null,
        is_pit_out_lap: false,
        is_valid: true,
      });

      console.log('payload', lapPayload);

      await this.sessionRuntime.onLapPersisted({
        sessionId: this.activeSessionId,
        driverId,
        controllerAddress: lapPayload.controllerAddress,
        lapNumber: lapPayload.lapNumber,
        lapTimeMs: lapPayload.lapTimeMs,
        sector1Ms: lapPayload.sectorTimes?.s1 ?? null,
        sector2Ms: lapPayload.sectorTimes?.s2 ?? null,
      });

      return;
    }
  }
}
