import { MqttService } from './../mqtt/mqtt.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { SessionsRepo } from './sessions.repo';
import { StartSessionDto } from './dto/start-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepo: SessionsRepo,
    private readonly mqttService: MqttService,
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
        const seconds = dto.durationMinutes * 60;

        await this.sessionsRepo.startSession(sessionId, {
          time_limit_seconds: seconds,
          lap_limit: null,
        });

        await this.mqttService.publish('race_control/sessions/start', {
          sessionId,
          mode: 'TIME',
          timeLimitSeconds: seconds,
          lapLimit: null,
          sessionType: session.session_type,
        });
      case 'RACE':
        if (!dto.lapLimit) {
          throw new BadRequestException('lapLimit required for race');
        }

        await this.sessionsRepo.startSession(sessionId, {
          time_limit_seconds: null,
          lap_limit: dto.lapLimit,
        });

        await this.mqttService.publish('race_control/sessions/start', {
          sessionId,
          mode: 'LAPS',
          timeLimitSeconds: null,
          lapLimit: dto.lapLimit,
          sessionType: session.session_type,
        });
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
