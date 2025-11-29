// track.service.ts
import { Injectable, Logger } from '@nestjs/common';

interface LapComputationState {
  lastStartFinish?: number;
  lastS1?: number;
  lastS2?: number;
  lapIndex: number;
}

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);
}
