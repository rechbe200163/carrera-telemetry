import { SessionTypeBadge } from '../session-type-badge';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { getSessionById } from '@/lib/api/session-api.service';
import { getMeetingById } from '@/lib/api/meetings-api.service';
import { getChampionshipById } from '@/lib/api/championship-api.service';
import Link from 'next/link';

async function HeaderComponent({ sessionId }: { sessionId: number }) {
  const session = await getSessionById(Number(sessionId));
  const meeting = await getMeetingById(Number(session.meeting_id));
  const championship = await getChampionshipById(
    Number(meeting.championship_id!)
  );

  if (!session) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Session nicht gefunden</h1>
          <Button asChild>
            <Link href='/meetings'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Zurück
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild>
          <Link href={`/sessions/${session.id}`}>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>

        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Statistiken</h1>
          <p className='text-muted-foreground flex items-center gap-2 mt-1'>
            <SessionTypeBadge type={session.session_type} />
            {meeting?.name} - {championship?.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeaderComponent;
