import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BarChart3,
  Circle,
  ExternalLink,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { SessionTypeBadge } from '@/components/session-type-badge';
import { StatusBadge } from '@/components/status-badge';
import { DriverBadge } from '@/components/driver-badge';
import { getSessionById } from '@/lib/api/session-api.service';
import { getMeetingById } from '@/lib/api/meetings-api.service';
import { getSessionEntriesBySessionId } from '@/lib/api/session-entries-api.service';
import { StartSessionForm } from '@/components/forms/sessions/start-session-form';
import { AddSessionEntryForm } from '@/components/forms/session-entries/AddSessionEntries';
import { getAllDrivers } from '@/lib/api/driver-api.service';
import { getAllControllers } from '@/lib/api/controller-api.service copy';
import { RaceSessionStatus } from '@/components/race-session-status';
import { TimedSessionCountdown } from '@/components/timed-session-countdown';
import { getChampionshipById } from '@/lib/api/championship-api.service';
import DeleteSessionEntries from '@/components/forms/session-entries/DeleteSessionEntries';
import HeaderComponent from '@/components/helpers/HeaderComponent';

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSessionById(Number(id));
  console.log(session);
  const meetingId = session.meeting_id;
  const meeting = await getMeetingById(meetingId);
  const championshipId = meeting.championship_id;
  if (!championshipId) return;
  const championship = await getChampionshipById(championshipId);

  const drivers = await getAllDrivers();
  const controllers = await getAllControllers();

  if (!session) {
    return (
      <div className='flex flex-col'>
        <div className='p-6'>
          <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center'>
            <h1 className='mb-2 text-xl font-semibold'>
              Session nicht gefunden
            </h1>
            <p className='mb-4 text-muted-foreground'>
              Die Session mit ID &quot;{id}&quot; existiert nicht.
            </p>
            <Button asChild>
              <Link href='/meetings'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Zurück zu Meetings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Session Entries für diese Session
  const sessionEntries = await getSessionEntriesBySessionId(session.id);
  console.log(sessionEntries);

  const hasEntries = sessionEntries.length > 0;

  const sessionStatus = session.status;
  return (
    <div className='flex flex-col'>
      <div className='space-y-6 p-6'>
        {/* Session Header */}
        <HeaderComponent sessionId={Number(id)} />

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Control Panel */}
          <Card className='border-border bg-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Zap className='h-4 w-4 text-primary' />
                Session Control
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {sessionStatus === 'PLANNED' && (
                <StartSessionForm
                  sessionId={session.id}
                  sessionType={session.session_type}
                  hasEntries={hasEntries}
                />
              )}

              {sessionStatus === 'LIVE' && (
                <>
                  <div className='rounded-lg border border-status-live/50 bg-status-live/20 p-4 text-center'>
                    <div className='mb-2 flex items-center justify-center gap-2'>
                      <Circle className='h-3 w-3 animate-pulse fill-status-live text-status-live' />
                      <span className='text-sm font-medium text-status-live'>
                        Session läuft
                      </span>
                    </div>
                    {session.session_type === 'RACE' ? (
                      <RaceSessionStatus
                        lapLimit={session.lap_limit!}
                        sessionId={session.id}
                      />
                    ) : (
                      <TimedSessionCountdown
                        timeLimitMinutes={session.time_limit_seconds!}
                      />
                    )}
                  </div>
                  <Button className='w-full' asChild>
                    <Link href={`/sessions/${session.id}/live`}>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      Live Timing öffnen
                    </Link>
                  </Button>
                </>
              )}

              {sessionStatus === 'FINISHED' && (
                <>
                  <div className='rounded-lg bg-secondary p-4 text-center'>
                    <p className='mb-2 text-sm text-muted-foreground'>
                      Session beendet
                    </p>
                    <p className='font-mono text-lg'>
                      {session.session_type === 'RACE'
                        ? `${session.lap_limit ?? '-'} Runden`
                        : `${(session.time_limit_seconds && session.time_limit_seconds / 60) ?? '-'} Minuten`}
                    </p>
                  </div>
                  <Button className='w-full' asChild>
                    <Link href={`/sessions/${session.id}/results`}>
                      Ergebnisse anzeigen
                    </Link>
                  </Button>{' '}
                  <Button
                    className='w-full bg-transparent'
                    asChild
                    variant='outline'
                  >
                    <Link href={`/sessions/${session.id}/lap-stats`}>
                      <BarChart3 className='mr-2 h-4 w-4' />
                      Einzelne Statistiken
                    </Link>
                  </Button>
                  <Button
                    className='w-full bg-transparent'
                    asChild
                    variant='outline'
                  >
                    <Link href={`/sessions/${session.id}/stats`}>
                      <TrendingUp className='mr-2 h-4 w-4' />
                      Runden Vergeleich
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Driver-Controller Assignment */}
          <Card className='border-border bg-card lg:col-span-2'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Zap className='h-4 w-4 text-primary' />
                Fahrer-Zuordnung
              </CardTitle>

              <AddSessionEntryForm
                sessionId={session.id}
                drivers={drivers}
                controllers={controllers}
              />
            </CardHeader>
            <CardContent>
              {hasEntries ? (
                <div className='space-y-2'>
                  {sessionEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className='flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3'
                    >
                      <div className='flex items-center gap-4'>
                        <DriverBadge driver={entry.drivers!} showName />
                      </div>
                      <div className='flex items-center gap-6'>
                        <div className='text-right'>
                          <p className='text-xs text-muted-foreground'>
                            Kontroller
                          </p>
                          <p className='font-mono font-medium'>
                            Addresse {entry.controller_address + 1}
                          </p>
                        </div>
                        <div className='min-w-32 text-right'>
                          <p className='text-xs text-muted-foreground'>Auto</p>
                          <p className='text-sm'>{entry.car_label || '-'}</p>
                        </div>
                        <DeleteSessionEntries
                          controllerAddress={entry.controller_address}
                          sessionId={entry.session_id}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='space-y-3 rounded-lg border border-dashed border-border p-8 text-center'>
                  <p className='text-muted-foreground'>
                    Noch keine Fahrer zugeordnet. Lege zuerst Session Entries
                    an, bevor du die Session startest.
                  </p>
                  <AddSessionEntryForm
                    sessionId={session.id}
                    drivers={drivers}
                    controllers={controllers}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
