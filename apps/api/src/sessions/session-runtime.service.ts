// src/sessions/session-runtime.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SessionsRepo } from './sessions.repo';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionType } from 'generated/prisma/enums';
import { Observable, Subject } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SessionLifecycleService } from './session-lifecycle.service';
import { SESSION_STARTED_EVENT } from 'src/events/events';

// --- Runtime-Typen für Live-UI ---

export type DriverRuntimeState = {
  driverId: number;
  controllerAddress: number;

  // lapsCompleted = ANZAHL ABGESCHLOSSENER (persistierter) RUNDEN
  lapsCompleted: number;

  // currentLap = die gerade laufende Runde (also lapsCompleted + 1)
  currentLap: number;

  lastLapMs: number | null;
  bestLapMs: number | null;
  sector1Ms: number | null;
  sector2Ms: number | null;
  totalTimeMs: number;
  gapToLeaderMs: number | null;

  // NEU: für "wartet nicht ewig" + Finish-Phase
  lastProgressAtMs: number;
};

export type SessionRuntimeSnapshot = {
  sessionId: number;
  updatedAt: string;

  startedAt: string | null;
  timeLimitSeconds: number | null;

  // optional für UI (nice-to-have)
  finishPhaseActive?: boolean;
  finishTriggeredAtMs?: number | null;

  drivers: DriverRuntimeState[];
};

// --- Session-Metadaten für Limit-Logik ---

type FinishPhaseState = {
  active: boolean;
  triggeredAtMs: number;
  triggeredByDriverId: number;
  leaderLapAtTrigger: number;

  // Fix für "sehr nahe beieinander"
  graceMs: number;

  // Fix damit Session nicht ewig hängt wenn jemand stehen bleibt
  inactivityTimeoutMs: number;
};

type SessionRuntimeState = {
  sessionId: number;
  meetingId: number | null;
  sessionType: SessionType;
  lapLimit: number | null;
  timeLimitSeconds: number | null;
  startedAt: Date;
  finishPhase: FinishPhaseState | null;
};

@Injectable()
export class SessionRuntimeService {
  private readonly logger = new Logger(SessionRuntimeService.name);

  // Zeit-/Lap-Limit-Logik pro Session
  private readonly runtimeBySession = new Map<number, SessionRuntimeState>();

  // Live-State pro Session: sessionId -> (driverId -> DriverRuntimeState)
  private readonly driversBySession = new Map<
    number,
    Map<number, DriverRuntimeState>
  >();

  // SSE-Streams pro Session
  private readonly subjectsBySession = new Map<
    number,
    Subject<SessionRuntimeSnapshot>
  >();

  private readonly tickersBySession = new Map<number, NodeJS.Timeout>();

  // Tuning: kann man später configbar machen
  private readonly FINISH_GRACE_MS = 800;
  private readonly FINISH_INACTIVITY_TIMEOUT_MS = 30000;

  constructor(
    private readonly sessionsRepo: SessionsRepo,
    private readonly mqtt: MqttService,
    private readonly eventEmitter: EventEmitter2,
    private readonly lifecycle: SessionLifecycleService,
  ) {}

  // ---------------------------------------------------------------------------
  // SESSION-LIFECYCLE
  // ---------------------------------------------------------------------------

  /**
   * Wird aufgerufen, wenn du im Backend / Frontend eine Session startest.
   */
  async onSessionStart(sessionId: number): Promise<void> {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) {
      this.logger.warn(`onSessionStart: session ${sessionId} not found`);
      return;
    }

    if (!session.start_time) {
      this.logger.warn(
        `onSessionStart: session ${sessionId} has no start_time; cannot start runtime`,
      );
      return;
    }

    const state: SessionRuntimeState = {
      sessionId,
      meetingId: session.meeting_id,
      sessionType: session.session_type, // PRACTICE | QUALYFING | RACE | FUN
      lapLimit: session.lap_limit,
      timeLimitSeconds: session.time_limit_seconds,
      startedAt: session.start_time,
      finishPhase: null,
    };

    this.runtimeBySession.set(sessionId, state);

    // initiale Live-Maps anlegen/clearen
    this.driversBySession.set(sessionId, new Map());
    this.ensureSubject(sessionId);

    // Ticker starten (Zeitlimit + UI ticks + FinishPhase Check)
    this.startTicker(sessionId);

    // Event für UI/andere Services
    this.eventEmitter.emit(SESSION_STARTED_EVENT, {
      sessionId,
      meetingId: session.meeting_id,
      sessionType: session.session_type,
      lapLimit: session.lap_limit,
      timeLimitSeconds: session.time_limit_seconds,
      startedAt: session.start_time,
    });

    // optional: "start" Topic nach draußen schicken (für Python, etc.)
    await this.mqtt.publish('race_control/sessions/start', { sessionId });

    this.logger.log(
      `Session ${sessionId} started: type=${state.sessionType}, lapLimit=${state.lapLimit}, timeLimit=${state.timeLimitSeconds}`,
    );
  }

  /**
   * Wird nach jedem gespeicherten Lap aufgerufen.
   * WICHTIG: lapNumber muss hier die ABGESCHLOSSENE (persistierte) Runde sein.
   */
  async onLapPersisted(args: {
    sessionId: number;
    driverId: number;
    controllerAddress: number;
    lapNumber: number; // finished lap number
    lapTimeMs: number;
    sector1Ms?: number | null;
    sector2Ms?: number | null;
  }): Promise<void> {
    const {
      sessionId,
      driverId,
      controllerAddress,
      lapNumber,
      lapTimeMs,
      sector1Ms,
      sector2Ms,
    } = args;

    const state = this.runtimeBySession.get(sessionId);
    if (!state) return;

    const nowMs = Date.now();

    // Live-State für diesen Fahrer holen/erzeugen
    const driver = this.ensureDriverState(
      sessionId,
      driverId,
      controllerAddress,
    );

    // --- Live-State Update (Lap wurde ABGESCHLOSSEN) ---
    driver.lapsCompleted = lapNumber;

    // nach einer abgeschlossenen Runde fährt er in der NÄCHSTEN Runde
    driver.currentLap = lapNumber + 1;

    driver.lastLapMs = lapTimeMs;
    driver.bestLapMs =
      driver.bestLapMs == null
        ? lapTimeMs
        : Math.min(driver.bestLapMs, lapTimeMs);
    driver.totalTimeMs += lapTimeMs;

    if (sector1Ms != null) driver.sector1Ms = sector1Ms;
    if (sector2Ms != null) driver.sector2Ms = sector2Ms;

    // Progress timestamp (wichtig für FinishPhase Timeout)
    driver.lastProgressAtMs = nowMs;

    // Gaps & Snapshot neu berechnen
    this.recalculateGaps(sessionId);
    this.broadcastSnapshot(sessionId);

    // -----------------------------------------------------------------------
    // FINISH-LOGIK (F1-Style)
    // -----------------------------------------------------------------------

    // A) Race: FinishPhase starten, sobald irgendwer lapLimit erreicht.
    //    Sieger steht dann fest (triggeredByDriverId), aber Session endet erst,
    //    wenn alle fertig sind oder timeout greift.
    if (state.sessionType === SessionType.RACE && state.lapLimit !== null) {
      if (lapNumber >= state.lapLimit && state.finishPhase == null) {
        const leaderId = this.getLeaderDriverId(sessionId);
        if (leaderId === driverId) {
          this.startFinishPhase(sessionId, state, driverId);
        } else {
          this.logger.log(
            `Session ${sessionId}: lapLimit reached by driver=${driverId} but leader=${leaderId} -> not starting finish phase yet`,
          );
        }
      }

      // Wenn FinishPhase aktiv: prüfen, ob wir jetzt beenden dürfen
      if (state.finishPhase?.active) {
        if (this.areAllDriversFinished(sessionId, state)) {
          this.logger.log(
            `Session ${sessionId}: finish phase complete -> finishing session lifecycle`,
          );
          await this.lifecycle.finishSessionLifeCycle(sessionId);
          return;
        }
      }
    }

    // -----------------------------------------------------------------------
    // ZEITLIMIT (Practice/Qualy)
    // -----------------------------------------------------------------------

    if (state.timeLimitSeconds !== null) {
      const endTs = state.startedAt.getTime() + state.timeLimitSeconds * 1000;
      if (nowMs >= endTs) {
        this.logger.log(
          `Session ${sessionId}: timeLimit ${state.timeLimitSeconds}s reached -> finishing session lifecycle`,
        );
        await this.lifecycle.finishSessionLifeCycle(sessionId);
        return;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Live-Updates von LapEventsConsumer (Sektor-Events)
  // ---------------------------------------------------------------------------

  /**
   * Wird vom LapEventsConsumer bei jedem Sector-Event aufgerufen.
   * Speichert nur in-memory und triggert SSE, KEINE DB-Änderung.
   */
  async onSectorUpdate(args: {
    sessionId: number;
    driverId: number;
    controllerAddress: number;
    lapNumber: number; // aktuelle Runde (laufende Runde)
    sectorNumber: 1 | 2;
    sectorTimeMs: number;
    wallClockTs: number;
  }): Promise<void> {
    const {
      sessionId,
      driverId,
      controllerAddress,
      lapNumber,
      sectorNumber,
      sectorTimeMs,
    } = args;

    const state = this.runtimeBySession.get(sessionId);
    if (!state) return;

    const driver = this.ensureDriverState(
      sessionId,
      driverId,
      controllerAddress,
    );

    driver.currentLap = lapNumber;

    if (sectorNumber === 1) driver.sector1Ms = sectorTimeMs;
    if (sectorNumber === 2) driver.sector2Ms = sectorTimeMs;

    // Progress timestamp (wenn jemand noch Sektoren fährt, ist er "aktiv")
    driver.lastProgressAtMs = Date.now();

    this.broadcastSnapshot(sessionId);
  }

  // ---------------------------------------------------------------------------
  // SSE-API
  // ---------------------------------------------------------------------------

  streamSession(sessionId: number): Observable<SessionRuntimeSnapshot> {
    const subject = this.ensureSubject(sessionId);

    // initialer Snapshot (kann am Anfang leer sein)
    const snap = this.buildSnapshot(sessionId);
    setTimeout(() => subject.next(snap), 0);

    return subject.asObservable();
  }

  // ---------------------------------------------------------------------------
  // interne Helfer
  // ---------------------------------------------------------------------------

  shouldAcceptLap(args: {
    sessionId: number;
    driverId: number;
    lapNumber: number;
  }): boolean {
    const state = this.runtimeBySession.get(args.sessionId);
    if (!state) return false;

    if (state.sessionType !== SessionType.RACE) return true;
    if (state.lapLimit == null) return true;

    if (args.lapNumber > state.lapLimit) {
      this.logger.log(
        `Session ${args.sessionId}: ignoring lap ${args.lapNumber} from driver=${args.driverId} (lapLimit=${state.lapLimit})`,
      );
      return false;
    }

    return true;
  }

  private ensureDriverState(
    sessionId: number,
    driverId: number,
    controllerAddress: number,
  ): DriverRuntimeState {
    if (!this.driversBySession.has(sessionId)) {
      this.driversBySession.set(sessionId, new Map());
    }

    const map = this.driversBySession.get(sessionId)!;

    if (!map.has(driverId)) {
      map.set(driverId, {
        driverId,
        controllerAddress,
        lapsCompleted: 0,
        currentLap: 1,
        lastLapMs: null,
        bestLapMs: null,
        sector1Ms: null,
        sector2Ms: null,
        totalTimeMs: 0,
        gapToLeaderMs: null,
        lastProgressAtMs: Date.now(),
      });
    } else {
      // falls controllerAddress später erst sicher ist
      map.get(driverId)!.controllerAddress = controllerAddress;
    }

    return map.get(driverId)!;
  }

  private ensureSubject(sessionId: number): Subject<SessionRuntimeSnapshot> {
    if (!this.subjectsBySession.has(sessionId)) {
      this.subjectsBySession.set(
        sessionId,
        new Subject<SessionRuntimeSnapshot>(),
      );
    }
    return this.subjectsBySession.get(sessionId)!;
  }

  private buildSnapshot(sessionId: number): SessionRuntimeSnapshot {
    const driversMap = this.driversBySession.get(sessionId) ?? new Map();
    const unsorted = Array.from(driversMap.values());
    const drivers = this.sortDrivers(sessionId, unsorted);

    const runtime = this.runtimeBySession.get(sessionId);

    return {
      sessionId,
      updatedAt: new Date().toISOString(),
      startedAt: runtime?.startedAt ? runtime.startedAt.toISOString() : null,
      timeLimitSeconds: runtime?.timeLimitSeconds ?? null,
      finishPhaseActive: runtime?.finishPhase?.active ?? false,
      finishTriggeredAtMs: runtime?.finishPhase?.triggeredAtMs ?? null,
      drivers,
    };
  }

  private recalculateGaps(sessionId: number): void {
    const driversMap = this.driversBySession.get(sessionId);
    if (!driversMap) return;

    const drivers = Array.from(driversMap.values()).sort(
      (a, b) =>
        b.lapsCompleted - a.lapsCompleted || a.totalTimeMs - b.totalTimeMs,
    );

    if (drivers.length === 0) return;

    const leader = drivers[0];
    for (const d of drivers) {
      d.gapToLeaderMs = d.totalTimeMs - leader.totalTimeMs;
    }
  }

  private broadcastSnapshot(sessionId: number): void {
    const subject = this.subjectsBySession.get(sessionId);
    if (!subject) return;
    subject.next(this.buildSnapshot(sessionId));
  }

  private sortDrivers(
    sessionId: number,
    drivers: DriverRuntimeState[],
  ): DriverRuntimeState[] {
    const runtime = this.runtimeBySession.get(sessionId);
    const type = runtime?.sessionType;

    // PRACTICE / QUALIFYING / FUN: nach Best Lap sortieren
    if (
      type === SessionType.PRACTICE ||
      type === SessionType.QUALYFING ||
      type === SessionType.FUN
    ) {
      return [...drivers].sort((a, b) => {
        const aBest = a.bestLapMs ?? Number.MAX_SAFE_INTEGER;
        const bBest = b.bestLapMs ?? Number.MAX_SAFE_INTEGER;

        if (aBest !== bBest) return aBest - bBest;
        if (a.lapsCompleted !== b.lapsCompleted)
          return b.lapsCompleted - a.lapsCompleted;
        return a.driverId - b.driverId;
      });
    }

    // RACE: nach Runden und Total Time
    return [...drivers].sort((a, b) => {
      if (a.lapsCompleted !== b.lapsCompleted)
        return b.lapsCompleted - a.lapsCompleted;
      if (a.totalTimeMs !== b.totalTimeMs) return a.totalTimeMs - b.totalTimeMs;
      return a.driverId - b.driverId;
    });
  }

  // ---------------------------------------------------------------------------
  // Finish Phase (F1-Style)
  // ---------------------------------------------------------------------------

  private startFinishPhase(
    sessionId: number,
    state: SessionRuntimeState,
    triggeredByDriverId: number,
  ): void {
    const driversMap = this.driversBySession.get(sessionId) ?? new Map();
    const leaderLapAtTrigger = Math.max(
      0,
      ...Array.from(driversMap.values()).map((d) => d.lapsCompleted),
    );

    state.finishPhase = {
      active: true,
      triggeredAtMs: Date.now(),
      triggeredByDriverId,
      leaderLapAtTrigger,
      graceMs: this.FINISH_GRACE_MS,
      inactivityTimeoutMs: this.FINISH_INACTIVITY_TIMEOUT_MS,
    };

    this.logger.log(
      `Session ${sessionId}: finish phase started by driver=${triggeredByDriverId} (leaderLapAtTrigger=${leaderLapAtTrigger}, lapLimit=${state.lapLimit}, graceMs=${this.FINISH_GRACE_MS}, inactivityTimeoutMs=${this.FINISH_INACTIVITY_TIMEOUT_MS})`,
    );
  }

  /**
   * "Alle fertig" bedeutet:
   * - Grace Window vorbei (damit nahe beieinander sicher persisted)
   * - jeder Fahrer ist entweder:
   *   a) >= lapLimit (Final Lap beendet)
   *   b) oder seit X ms kein Progress mehr (DNF / disconnected / Auto steht)
   */
  private areAllDriversFinished(
    sessionId: number,
    state: SessionRuntimeState,
  ): boolean {
    const fp = state.finishPhase;
    if (!fp || state.lapLimit == null) return false;

    const nowMs = Date.now();

    // Grace: währenddessen niemals finishen
    if (nowMs - fp.triggeredAtMs < fp.graceMs) {
      return false;
    }

    const driversMap = this.driversBySession.get(sessionId);
    if (!driversMap || driversMap.size === 0) return true;

    for (const d of driversMap.values()) {
      if (d.lapsCompleted >= state.lapLimit) continue;

      // Wer beim Trigger >1 Runde zuruecklag, wird nicht mehr erwartet.
      if (fp.leaderLapAtTrigger - d.lapsCompleted > 1) {
        continue;
      }

      const inactivityTimeoutMs = Math.max(
        fp.inactivityTimeoutMs,
        (d.lastLapMs ?? 0) * 2,
      );

      // kein progress -> als finished behandeln
      if (nowMs - d.lastProgressAtMs > inactivityTimeoutMs) {
        continue;
      }

      // sonst noch aktiv und nicht fertig
      return false;
    }

    return true;
  }

  private startTicker(sessionId: number): void {
    if (this.tickersBySession.has(sessionId)) return;

    const t = setInterval(async () => {
      const state = this.runtimeBySession.get(sessionId);
      if (!state) return;

      // 1) RACE: finishPhase auch ohne neue laps/splits prüfen
      if (
        state.sessionType === SessionType.RACE &&
        state.lapLimit !== null &&
        state.finishPhase?.active
      ) {
        if (this.areAllDriversFinished(sessionId, state)) {
          this.logger.log(
            `Session ${sessionId}: finish phase complete (ticker) -> finishing session lifecycle`,
          );
          await this.lifecycle.finishSessionLifeCycle(sessionId);
          return;
        }
      }

      // 2) Zeitbasierte Sessions: auto-finish auch wenn keine Laps kommen
      if (state.timeLimitSeconds != null) {
        const endTs = state.startedAt.getTime() + state.timeLimitSeconds * 1000;
        if (Date.now() >= endTs) {
          await this.lifecycle.finishSessionLifeCycle(sessionId);
          return;
        }
      }

      // 3) Snapshot pushen, damit UI "tickt"
      this.broadcastSnapshot(sessionId);
    }, 250);

    this.tickersBySession.set(sessionId, t);
  }

  private stopTicker(sessionId: number): void {
    const t = this.tickersBySession.get(sessionId);
    if (t) clearInterval(t);
    this.tickersBySession.delete(sessionId);
  }

  async cleanup(sessionId: number): Promise<void> {
    this.stopTicker(sessionId);

    const finalSnap = this.buildSnapshot(sessionId);

    const subj = this.subjectsBySession.get(sessionId);
    if (subj) {
      subj.next(finalSnap);
      subj.complete();
      this.subjectsBySession.delete(sessionId);
    }

    this.runtimeBySession.delete(sessionId);
    this.driversBySession.delete(sessionId);
  }

  private getLeaderDriverId(sessionId: number): number | null {
    const driversMap = this.driversBySession.get(sessionId);
    if (!driversMap || driversMap.size === 0) return null;

    const drivers = Array.from(driversMap.values()).sort((a, b) => {
      if (a.lapsCompleted !== b.lapsCompleted)
        return b.lapsCompleted - a.lapsCompleted;
      if (a.totalTimeMs !== b.totalTimeMs) return a.totalTimeMs - b.totalTimeMs;
      return a.driverId - b.driverId;
    });

    return drivers[0]?.driverId ?? null;
  }
}
