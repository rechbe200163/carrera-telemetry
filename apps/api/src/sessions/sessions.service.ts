import { MqttService } from './../mqtt/mqtt.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { SessionsRepo } from './sessions.repo';
import { StartSessionDto } from './dto/start-session.dto';
import { SessionRuntimeService } from './session-runtime.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepo: SessionsRepo,
    private readonly mqttService: MqttService,
    private readonly sessionRuntimeService: SessionRuntimeService,
  ) {}

  async startSession(sessionId: number, dto: StartSessionDto) {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) throw new NotFoundException();

    switch (session.session_type) {
      case 'PRACTICE':
      case 'QUALYFING':
        if (!dto.durationMinutes) {
          throw new BadRequestException(
            'durationMinutes required for practice/quali',
          );
        }

        await this.sessionsRepo.startSession(sessionId, {
          time_limit_seconds: dto.durationMinutes * 60,
          lap_limit: null,
        });

        this.sessionRuntimeService.onSessionStart(sessionId);
        break;
      case 'RACE':
        if (!dto.lapLimit) {
          throw new BadRequestException('lapLimit required for race');
        }

        await this.sessionsRepo.startSession(sessionId, {
          time_limit_seconds: null,
          lap_limit: dto.lapLimit,
        });

        this.sessionRuntimeService.onSessionStart(sessionId);
        break;
      case 'FUN':
        throw new NotImplementedException(
          'this functionality is yet to be implemented',
        );
      default:
        throw new BadRequestException(
          'no implementation for this session type',
        );
    }
  }

  async abortSession(id: number) {
    throw new NotImplementedException(
      'this functionality is yet to be implemented',
    );
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
