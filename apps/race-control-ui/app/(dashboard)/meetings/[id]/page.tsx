import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, RotateCcw, Eye, Waypoints } from 'lucide-react';
import Link from 'next/link';
import { getMeetingById } from '@/lib/api/meetings-api.service';
import { StatusBadge } from '@/components/status-badge';
import { getChampionshipByMeetingId } from '@/lib/api/championship-api.service';
import { getSessionsByMeetingId } from '@/lib/api/session-api.service';
import { SessionTypeBadge } from '@/components/session-type-badge';
import { SessionType } from '@/lib/types';

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meeting = await getMeetingById(Number(id));
  const championship = await getChampionshipByMeetingId(Number(id));
  const sessions = await getSessionsByMeetingId(Number(id));

  console.log('sessions', sessions);

  const getSessionIcon = (type: SessionType) => {
    switch (type) {
      case 'PRACTICE':
        return <Clock className='h-5 w-5' />;
      case 'QUALYFING':
        return <Clock className='h-5 w-5' />;
      case 'RACE':
        return <Waypoints className='h-5 w-5' />;
      default:
        return <Clock className='h-5 w-5' />;
    }
  };

  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div>
          <div className='flex items-center gap-3 mb-1'>
            <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 font-mono text-lg font-bold text-primary'>
              R{meeting.round_number}
            </span>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {meeting.name}
              </h1>
              <p className='text-muted-foreground'>
                {championship?.name} · Runde {meeting.round_number}
              </p>
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        <div>
          <h2 className='text-lg font-semibold mb-4'>Sessions</h2>
          <div className='grid gap-4 md:grid-cols-3'>
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`bg-card border-border hover:border-primary/50 transition-colors ${
                  session.status === 'LIVE' ? 'ring-2 ring-status-live/50' : ''
                }`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <SessionTypeBadge type={session.session_type} />
                      {getSessionIcon(session.session_type)}
                    </div>
                    <StatusBadge status={session.status} size='sm' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-3'>
                    {session.session_type === 'RACE' ? (
                      <div className='rounded-lg bg-secondary/50 p-3'>
                        <p className='text-xs text-muted-foreground'>Runden</p>
                        <p className='text-xl font-bold font-mono'>
                          {session.lap_limit || '-'}
                        </p>
                      </div>
                    ) : (
                      <div className='rounded-lg bg-secondary/50 p-3'>
                        <p className='text-xs text-muted-foreground'>Dauer</p>
                        <p className='text-xl font-bold font-mono'>
                          {(session.time_limit_seconds &&
                            session.time_limit_seconds / 60) ||
                            '-'}
                        </p>
                      </div>
                    )}
                    <div className='rounded-lg bg-secondary/50 p-3'>
                      <p className='text-xs text-muted-foreground'>Status</p>
                      <p className='text-sm font-medium mt-1'>
                        {session.status}
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    {session.status === 'FINISHED' && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 bg-transparent'
                        asChild
                      >
                        <Link href={`/sessions/${session.id}/results`}>
                          <Eye className='mr-1 h-3 w-3' />
                          Ergebnisse
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant={
                        session.status === 'LIVE' ? 'default' : 'secondary'
                      }
                      size='sm'
                      className='flex-1'
                      asChild
                    >
                      <Link href={`/sessions/${session.id}`}>
                        Session öffnen
                        <ArrowRight className='ml-1 h-3 w-3' />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
