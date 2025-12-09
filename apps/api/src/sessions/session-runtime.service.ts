// src/sessions/session-runtime.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SessionsRepo } from './sessions.repo';
import { LapsRepo } from 'src/laps/laps.repo';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionType, Stauts } from 'generated/prisma/enums';
import { SessionResultsRepo } from 'src/session-result/session-result.repo';
import { SessionResultsService } from 'src/session-result/session-result.service';
// wenn du @prisma/client verwendest:

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

  // falls du irgendwann mehrere Sessions parallel fährst
  private readonly runtimeBySession = new Map<number, SessionRuntimeState>();

  constructor(
    private readonly sessionsRepo: SessionsRepo,
    private readonly sessionResultsService: SessionResultsService,
    private readonly mqtt: MqttService,
  ) {}

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

    // optional: "active" Topic nach draußen schicken (für Python, etc.)
    await this.mqtt.publish('race_control/sessions/start', {
      sessionId,
    });

    this.logger.log(
      `Session ${sessionId} started: type=${state.sessionType}, lapLimit=${state.lapLimit}, timeLimit=${state.timeLimitSeconds}`,
    );
  }

  /**
   * Wird nach jedem gespeicherten Lap aufgerufen.
   * Hier entscheidest du, ob die Session endet.
   */
  async onLapPersisted(sessionId: number, lapNumber: number): Promise<void> {
    const state = this.runtimeBySession.get(sessionId);
    if (!state) {
      // kann z.B. sein, wenn du bisher keine Runtime gesetzt hast
      return;
    }

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

  /**
   * Session wirklich beenden:
   * - status = FINISHED
   * - end_time setzen
   * - session_results berechnen & speichern
   * - Session aus Runtime-Map entfernen
   * - optional MQTT Events publishen
   */
  async finishSession(sessionId: number): Promise<void> {
    // 1) Session in DB schließen
    await this.sessionsRepo.finishSession(sessionId);

    // 2) Ergebnisse berechnen
    const results =
      await this.sessionResultsService.calculateSessionResults(sessionId);

    // 5) optional: an Python / CU "stop" schicken
    await this.mqtt.publish('race_control/sessions/stop', {
      sessionId,
    });

    this.runtimeBySession.delete(sessionId);
    this.logger.log(
      `Session ${sessionId} finished with ${results.length} results entries.`,
    );
  }

  /**
   * Berechnet session_results anhand der laps-Tabelle.
   * Punkte-Logik ist bewusst simpel gehalten – kannst du später ersetzen.
   */
}
