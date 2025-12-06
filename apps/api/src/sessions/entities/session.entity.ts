import { SessionType, Stauts } from 'generated/prisma/enums';
import { Lap } from 'src/laps/entities/lap.entity';
import { Meetings } from 'src/meetings/entities/meeting.entity';
import { SessionEntry } from 'src/session-entry/entities/session-entry.entity';
import { SessionResult } from 'src/session-result/entities/session-result.entity';

export class Session {
  id: number;
  meeting_id: number;
  session_type: SessionType;
  name: string;
  start_time: Date | null;
  end_time: Date | null;
  status: Stauts;
  time_limit_seconds: number | null;
  lap_limit: number | null;
  created_at: Date;
  laps?: Lap[];
  session_entries?: SessionEntry[];
  session_result?: SessionResult[];
  meetings?: Meetings;
}
