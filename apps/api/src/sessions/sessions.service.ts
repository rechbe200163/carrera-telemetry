import {
  BadRequestException,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SessionsRepo } from './sessions.repo';
import { StartSessionDto } from './dto/start-session.dto';
import { SessionRuntimeService } from './session-runtime.service';
import { SessionType, Stauts } from 'generated/prisma/enums';
import { SessionLifecycleService } from './session-lifecycle.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepo: SessionsRepo,
    private readonly sessionRuntimeService: SessionRuntimeService,
    private readonly sessionLifeCycle: SessionLifecycleService,
  ) {}

  async startSession(sessionId: number, dto: StartSessionDto) {
    const session = await this.sessionsRepo.findById(sessionId);
    switch (session.session_type) {
      case SessionType.PRACTICE:
      case SessionType.QUALYFING:
        if (!dto.durationMinutes) {
          throw new BadRequestException(
            'durationMinutes required for practice/quali',
          );
        }

        await this.sessionsRepo.startSession(sessionId, {
          time_limit_seconds: dto.durationMinutes * 60,
          lap_limit: null,
        });

        await this.sessionRuntimeService.onSessionStart(sessionId);
        break;
      case SessionType.RACE:
        if (!dto.lapLimit) {
          throw new BadRequestException('lapLimit required for race');
        }

        await this.sessionsRepo.startSession(sessionId, {
          time_limit_seconds: null,
          lap_limit: dto.lapLimit,
        });

        await this.sessionRuntimeService.onSessionStart(sessionId);
        break;
      case SessionType.FUN:
        await this.sessionsRepo.startSession(sessionId, {
          time_limit_seconds: null,
          lap_limit: null,
        });

        await this.sessionRuntimeService.onSessionStart(sessionId);
        break;
      default:
        throw new BadRequestException(
          'no implementation for this session type',
        );
    }
  }

  async createSession(data: CreateSessionDto) {
    return this.sessionsRepo.createSingleSession(data);
  }

  async abortSession(id: number): Promise<number> {
    const session = await this.sessionsRepo.findById(id);

    if (session.status !== Stauts.LIVE && session.status !== Stauts.PLANNED) {
      throw new BadRequestException('Session cannot be aborted');
    }

    await this.sessionsRepo.abortSession(id);
    await this.sessionRuntimeService.cleanup(id);

    return HttpStatus.OK;
  }

  async stopSession(id: number): Promise<number> {
    const session = await this.sessionsRepo.findById(id);

    if (session.status !== Stauts.LIVE) {
      throw new BadRequestException('Session not live');
    }

    // danach: einheitlich alles abschließen (Stats, Events, Runtime cleanup)
    // -> wenn finishSessionLifeCycle intern finishSession macht, dann NICHT doppelt machen
    await this.sessionLifeCycle.finishSessionLifeCycle(id); // falls Lifecycle das nicht macht

    return HttpStatus.OK;
  }

  async findByMeetingId(meetingId: number) {
    return this.sessionsRepo.findByMeetingId(meetingId);
  }

  async findAll() {
    return this.sessionsRepo.findAll();
  }
  async findOne(id: number) {
    return this.sessionsRepo.findById(id);
  }
}
