import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SessionTypeBadge } from '@/components/session-type-badge';
import { StatusBadge } from '@/components/status-badge';
import { sessionsApiService } from '@/lib/api/session-api.service';
import { meetingsApiService } from '@/lib/api/meetings-api.service copy 2';
import { championshipsApiService } from '@/lib/api/championship-api.service';

export default async function SessionsPage() {
  const sessions = await sessionsApiService.getAll();
  const meetings = await meetingsApiService.getAll();
  const championships = await championshipsApiService.getAll();

  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Sessions</h1>
          <p className='text-muted-foreground'>Alle Sessions im Überblick</p>
        </div>

        {/* Sessions List */}
        <div className='space-y-3'>
          {sessions.map((session) => {
            const meeting = meetings.find((m) => m.id === session.meeting_id);
            const championship = championships.find(
              (c) => c.id === meeting?.championship_id
            );

            return (
              <Card
                key={session.id}
                className={`bg-card border-border hover:border-primary/50 transition-colors ${
                  session.status === 'LIVE' ? 'ring-2 ring-status-live/50' : ''
                }`}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <SessionTypeBadge type={session.session_type} size='lg' />
                      <div>
                        <h3 className='font-semibold'>{meeting?.name}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {championship?.name} · Runde {meeting?.round_number}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        {session.session_type === 'RACE' ? (
                          <p className='font-mono font-bold'>
                            {session.lap_limit} Runden
                          </p>
                        ) : (
                          <p className='font-mono font-bold'>
                            {session.time_limit_seconds} min
                          </p>
                        )}
                      </div>
                      <StatusBadge status={session.status} />
                      <Button variant='secondary' asChild>
                        <Link href={`/sessions/${session.id}`}>
                          Öffnen
                          <ArrowRight className='ml-2 h-4 w-4' />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
