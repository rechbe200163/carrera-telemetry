import { session_entries } from './../../generated/prisma/client';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { LapsRepo } from 'src/laps/laps.repo';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionsRepo } from 'src/sessions/sessions.repo';

@Injectable()
export class LapEventsConsumer implements OnModuleInit {
  private activeSessionId: number | null = null;
  private controllerMap = new Map<number, number>(); // controllerAddress -> driverId

  constructor(
    private readonly mqtt: MqttService,
    private readonly sessionsRepo: SessionsRepo,
    private readonly lapsRepo: LapsRepo,
  ) {}

  onModuleInit() {
    // 1) Lap-Events
    this.mqtt.subscribe('carrera/cu/lapTimes', (payload) => {
      this.handleLapEvent(payload).catch(console.error);
    });

    // 2) Session-Start/End-Events vom Backend
    this.mqtt.subscribe('race_control/sessions/active', (payload) => {
      this.handleSessionActiveEvent(payload).catch(console.error);
    });
  }

  private async handleSessionActiveEvent(payload: any) {
    // payload: { sessionId: 12 }   oder { sessionId: null } zum Clearen
    const sessionId = payload.sessionId as number | null;

    if (!sessionId) {
      this.activeSessionId = null;
      this.controllerMap.clear();
      return;
    }

    this.activeSessionId = sessionId;
    this.controllerMap.clear();

    const session = await this.sessionsRepo.listEntriesForSession(sessionId);
    if (!session) return;
    if (!session.session_entries) return;
    for (const e of session.session_entries) {
      this.controllerMap.set(e.controller_address, e.driver_id);
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
  }
}
