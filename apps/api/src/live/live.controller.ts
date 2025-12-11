// src/live/live-sessions.controller.ts
import { Controller, Param, ParseIntPipe, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SessionRuntimeService,
  SessionRuntimeSnapshot,
} from 'src/sessions/session-runtime.service';

@Controller('live')
export class LiveSessionsController {
  constructor(private readonly runtime: SessionRuntimeService) {}

  @Sse('sessions/:sessionId')
  streamSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ): Observable<MessageEvent> {
    return this.runtime.streamSession(sessionId).pipe(
      map(
        (snapshot: SessionRuntimeSnapshot) =>
          ({
            data: snapshot,
          }) as MessageEvent,
      ),
    );
  }
}
