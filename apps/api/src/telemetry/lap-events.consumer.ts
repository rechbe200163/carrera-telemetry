import { Injectable, OnModuleInit } from '@nestjs/common';
import { LapsRepo } from 'src/laps/laps.repo';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionRuntimeService } from 'src/sessions/session-runtime.service';
import { SessionsRepo } from 'src/sessions/sessions.repo';

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
    // 1) Lap-Events
    this.mqtt.subscribe('carrera/cu/lapTimes', (payload) => {
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
    // Du könntest hier checken, ob es dieselbe aktive Session ist
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
      this.controllerMap.clear();
    }
  }

  private async handleLapEvent(payload: any) {
    if (!this.activeSessionId) return;

    const driverId = this.controllerMap.get(payload.controllerAddress);
    if (!driverId) return;

    await this.lapsRepo.create({
      session_id: this.activeSessionId,
      driver_id: driverId,
      lap_number: payload.lapNumber,
      date_start: new Date(payload.wallClockTs),
      lap_duration_ms: payload.lapTimeMs,
      duration_sector1: payload.sectorTimes?.s1 ?? null,
      duration_sector2: payload.sectorTimes?.s2 ?? null,
      duration_sector3: null,
      is_pit_out_lap: false,
      is_valid: true,
    });

    console.log('payload', payload);

    await this.sessionRuntime.onLapPersisted(
      this.activeSessionId,
      payload.lapNumber,
    );
  }
}
