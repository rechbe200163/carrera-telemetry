// sessions-events.service.ts
import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type SseEvent<T = any> = { data: T };

export type SessionEvent =
  | { type: 'session_start'; payload: { sessionId: number } }
  | {
      type: 'session_stop';
      payload: { sessionId: number; reason?: string; stoppedAt: string };
    };

@Injectable()
export class SessionsEventsService {
  private readonly subject = new Subject<SseEvent<SessionEvent>>();

  public readonly events$: Observable<SseEvent<SessionEvent>> =
    this.subject.asObservable();

  emit(event: SessionEvent) {
    this.subject.next({ data: event });
  }
}
