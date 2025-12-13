// src/sessions/session-runtime.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SessionsRepo } from './sessions.repo';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionType } from 'generated/prisma/enums';
import { SessionResultsService } from 'src/session-result/session-result.service';
import { Observable, Subject } from 'rxjs';
import { SessionsEventsService } from './sessions-events.service';

// --- Runtime-Typen für Live-UI ---

export type DriverRuntimeState = {
  driverId: number;
  controllerAddress: number;
  lapsCompleted: number;
  currentLap: number;
  lastLapMs: number | null;
  bestLapMs: number | null;
  sector1Ms: number | null;
  sector2Ms: number | null;
  totalTimeMs: number;
  gapToLeaderMs: number | null;
};

export type SessionRuntimeSnapshot = {
  sessionId: number;
  updatedAt: string;

  startedAt: string | null; // <-- NEU
  timeLimitSeconds: number | null; // <-- NEU (für Practice/Qualy/Fun)

  drivers: DriverRuntimeState[];
};

// --- Session-Metadaten für Limit-Logik ---

type SessionRuntimeState = {
  sessionId: number;
  sessionType: SessionType;
  lapLimit: number | null;
  timeLimitSeconds: number | null;
  startedAt: Date;
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

  constructor(
    private readonly sessionsRepo: SessionsRepo,
    private readonly sessionResultsService: SessionResultsService,
    private readonly mqtt: MqttService,
    private readonly events: SessionsEventsService,
  ) {}

  // ---------------------------------------------------------------------------
  // SESSION-LIFECYCLE (wie bisher, nur leicht erweitert)
  // ---------------------------------------------------------------------------

  /**
   * Wird aufgerufen, wenn du im Backend / Frontend eine Session startest.
   * z.B. nachdem du `race_control/sessions/start` published hast.
   */
  async onSessionStart(sessionId: number): Promise<void> {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) {
      this.logger.warn(`onSessionStart: session ${sessionId} not found`);
      return;
    }

    const state: SessionRuntimeState = {
      sessionId,
      sessionType: session.session_type, // PRACTICE | QUALYFING | RACE | FUN
      lapLimit: session.lap_limit,
      timeLimitSeconds: session.time_limit_seconds,
      startedAt: session.start_time!,
    };

    this.runtimeBySession.set(sessionId, state);
    this.startTicker(sessionId);

    // initiale Live-Maps anlegen/clearen
    this.driversBySession.set(sessionId, new Map());
    this.ensureSubject(sessionId); // SSE-Subject vorbereiten

    // optional: "start" Topic nach draußen schicken (für Python, etc.)
    await this.mqtt.publish('race_control/sessions/start', {
      sessionId,
    });

    this.logger.log(
      `Session ${sessionId} started: type=${state.sessionType}, lapLimit=${state.lapLimit}, timeLimit=${state.timeLimitSeconds}`,
    );
  }

  /**
   * Session wirklich beenden:
   * - status = FINISHED
   * - end_time setzen
   * - session_results berechnen & speichern
   * - Session aus Runtime-Maps entfernen
   * - MQTT "stop" publishen
   */
  async finishSession(sessionId: number): Promise<void> {
    // 1) Session in DB schließen
    this.events.emit({
      type: 'session_stop',
      payload: {
        sessionId,
        reason: 'finished',
        stoppedAt: new Date().toISOString(),
      },
    });

    await this.sessionsRepo.finishSession(sessionId);

    // 2) Ergebnisse berechnen
    const results =
      await this.sessionResultsService.calculateSessionResults(sessionId);

    // 3) optional: an Python / CU "stop" schicken
    await this.mqtt.publish('race_control/sessions/stop', {
      sessionId,
    });

    this.stopTicker(sessionId);

    const finalSnap = this.buildSnapshot(sessionId);

    // 4) Live-State aufräumen
    this.runtimeBySession.delete(sessionId);
    this.driversBySession.delete(sessionId);

    const subj = this.subjectsBySession.get(sessionId);
    if (subj) {
      subj.next(finalSnap);
      subj.complete();
      this.subjectsBySession.delete(sessionId);
    }

    this.logger.log(
      `Session ${sessionId} finished with ${results.length} results entries.`,
    );
  }

  /**
   * Wird nach jedem gespeicherten Lap aufgerufen.
   * Hier entscheidest du, ob die Session endet.
   * (Logik wie vorher – zusätzlich nutzen wir es für Live-State.)
   */
  async onLapPersisted(args: {
    sessionId: number;
    driverId: number;
    controllerAddress: number;
    lapNumber: number;
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
    if (!state) {
      return;
    }

    // Live-State für diesen Fahrer holen/erzeugen
    const driver = this.ensureDriverState(
      sessionId,
      driverId,
      controllerAddress,
    );

    // Lap-Zustand updaten
    driver.lapsCompleted = lapNumber;
    driver.currentLap = lapNumber; // oder lapNumber + 1, wenn du sofort auf nächste Runde springen willst
    driver.lastLapMs = lapTimeMs;
    driver.bestLapMs =
      driver.bestLapMs == null
        ? lapTimeMs
        : Math.min(driver.bestLapMs, lapTimeMs);
    driver.totalTimeMs += lapTimeMs;

    if (sector1Ms != null) {
      driver.sector1Ms = sector1Ms;
    }
    if (sector2Ms != null) {
      driver.sector2Ms = sector2Ms;
    }

    // Gaps & Snapshot neu berechnen
    this.recalculateGaps(sessionId);
    this.broadcastSnapshot(sessionId);

    // ---- ab hier: dein bisheriges Limit-/Finish-Handling ----

    const now = Date.now();

    // 1) Laps-basierte Sessions (z.B. RACE)
    if (
      state.sessionType === 'RACE' &&
      state.lapLimit !== null &&
      lapNumber >= state.lapLimit
    ) {
      this.logger.log(
        `Session ${sessionId}: lapLimit ${state.lapLimit} reached (lap=${lapNumber}) -> finishing session`,
      );
      await this.finishSession(sessionId);
      return;
    }

    // 2) Zeit-basierte Sessions (PRACTICE / QUALYFING / FUN)
    if (state.timeLimitSeconds !== null) {
      const endTs = state.startedAt.getTime() + state.timeLimitSeconds * 1000;
      if (now >= endTs) {
        this.logger.log(
          `Session ${sessionId}: timeLimit ${state.timeLimitSeconds}s reached -> finishing session`,
        );
        await this.finishSession(sessionId);
        return;
      }
    }
  }
  // ---------------------------------------------------------------------------
  // NEU: Live-Updates von LapEventsConsumer
  // ---------------------------------------------------------------------------

  /**
   * Wird vom LapEventsConsumer bei jedem Sector-Event aufgerufen.
   * Speichert nur in-memory und triggert SSE, KEINE DB-Änderung.
   */
  async onSectorUpdate(args: {
    sessionId: number;
    driverId: number;
    controllerAddress: number;
    lapNumber: number;
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

    const driver = this.ensureDriverState(
      sessionId,
      driverId,
      controllerAddress,
    );

    driver.currentLap = lapNumber;

    if (sectorNumber === 1) {
      driver.sector1Ms = sectorTimeMs;
    } else if (sectorNumber === 2) {
      driver.sector2Ms = sectorTimeMs;
    }

    // totalTimeMs könntest du hier optional inkrementell aufbauen,
    // wenn du die Sektoren pro Runde hinzufügen willst.

    this.broadcastSnapshot(sessionId);
  }

  // ---------------------------------------------------------------------------
  // NEU: SSE-API für Live-Frontend
  // ---------------------------------------------------------------------------

  /**
   * Wird vom LiveSessionsController verwendet, um einen SSE-Stream pro Session zu öffnen.
   */
  streamSession(sessionId: number): Observable<SessionRuntimeSnapshot> {
    const subject = this.ensureSubject(sessionId);
    // initialer Snapshot (kann am Anfang noch leer sein)
    const snap = this.buildSnapshot(sessionId);
    setTimeout(() => subject.next(snap), 0);
    console.log('snapshot', snap);
    return subject.asObservable();
  }

  // ---------------------------------------------------------------------------
  // interne Helfer für Live-State & SSE
  // ---------------------------------------------------------------------------

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
      });
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
    const snap = this.buildSnapshot(sessionId);
    subject.next(snap);
  }

  private sortDrivers(
    sessionId: number,
    drivers: DriverRuntimeState[],
  ): DriverRuntimeState[] {
    const runtime = this.runtimeBySession.get(sessionId);
    const type = runtime?.sessionType;

    // PRACTICE / QUALIFYING: nach Best Lap sortieren
    if (
      type === SessionType.PRACTICE ||
      type === SessionType.QUALYFING // genaue Enum-Bezeichnung aus deinem Prisma-Enum
    ) {
      return [...drivers].sort((a, b) => {
        const aBest = a.bestLapMs ?? Number.MAX_SAFE_INTEGER;
        const bBest = b.bestLapMs ?? Number.MAX_SAFE_INTEGER;

        if (aBest !== bBest) return aBest - bBest; // kleinere Best Lap nach vorne
        // Tie-Breaker: wer mehr Runden hat, ist vorne
        if (a.lapsCompleted !== b.lapsCompleted) {
          return b.lapsCompleted - a.lapsCompleted;
        }
        // letzter Tie-Breaker, damit Sortierung stabil ist:
        return a.driverId - b.driverId;
      });
    }

    // RACE (und z.B. FUN): nach Runden und Total Time
    return [...drivers].sort((a, b) => {
      // mehr Runden -> weiter vorne
      if (a.lapsCompleted !== b.lapsCompleted) {
        return b.lapsCompleted - a.lapsCompleted;
      }
      // gleiche Runden -> geringere Gesamtzeit -> weiter vorne
      if (a.totalTimeMs !== b.totalTimeMs) {
        return a.totalTimeMs - b.totalTimeMs;
      }
      return a.driverId - b.driverId;
    });
  }
  private startTicker(sessionId: number) {
    // nicht doppelt starten
    if (this.tickersBySession.has(sessionId)) return;

    const t = setInterval(async () => {
      const state = this.runtimeBySession.get(sessionId);
      if (!state) return;

      // Zeitbasierte Sessions: auto-finish auch wenn keine Laps kommen
      if (state.timeLimitSeconds != null) {
        const endTs = state.startedAt.getTime() + state.timeLimitSeconds * 1000;
        if (Date.now() >= endTs) {
          await this.finishSession(sessionId);
          return;
        }
      }

      // Snapshot pushen, damit UI "tickt"
      this.broadcastSnapshot(sessionId);
    }, 250); // 4 Hz reicht, wirkt smooth

    this.tickersBySession.set(sessionId, t);
  }

  private stopTicker(sessionId: number) {
    const t = this.tickersBySession.get(sessionId);
    if (t) clearInterval(t);
    this.tickersBySession.delete(sessionId);
  }
}
