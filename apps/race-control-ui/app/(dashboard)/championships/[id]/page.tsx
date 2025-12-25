import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getDriverStandingsByChampionship } from '@/lib/api/driverstandings-api.service';
import { StatusBadge } from '@/components/status-badge';
import { DriverBadge } from '@/components/driver-badge';
import AddMeetingsForm from '@/components/forms/meetings/AddMeeting';
import { getChampionshipById } from '@/lib/api/championship-api.service';
import { getMeetingsByChampionshipId } from '@/lib/api/meetings-api.service';
import { formatDate } from '@/lib/utils';

export default async function ChampionshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const championship = await getChampionshipById(Number(id));
  const meetings = await getMeetingsByChampionshipId(Number(id));
  const driverStandings = await getDriverStandingsByChampionship(Number(id));

  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-3 mb-1'>
              <h1 className='text-2xl font-bold tracking-tight'>
                {championship.name}
              </h1>
            </div>
            <p className='text-muted-foreground'>
              Saison {championship.season}
            </p>
          </div>
          <AddMeetingsForm
            championshipId={Number(id)}
            disabled={
              championship.held_meetings >= championship.planned_meetings
            }
          />
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Meetings Table */}
          <Card className='bg-card border-border lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-base'>Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {meetings &&
                  meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className='flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3 hover:bg-secondary/50 transition-colors'
                    >
                      <div className='flex items-center gap-4'>
                        <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-mono text-lg font-bold'>
                          {meeting.round_number}
                        </span>
                        <div>
                          <p className='font-medium'>{meeting.name}</p>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(meeting.start_date)}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <StatusBadge status={meeting.status} size='sm' />
                        <Button variant='ghost' size='sm' asChild>
                          <Link href={`/meetings/${meeting.id}`}>
                            Öffnen
                            <ArrowRight className='ml-1 h-3 w-3' />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Driver Standings */}
          <Card className='bg-card border-border'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-base'>
                Fahrer Wertung nach {championship.held_meetings}/
                {championship.planned_meetings} Rennen
              </CardTitle>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/standings'>Vollständig</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {driverStandings.map((standing) => (
                  <div
                    key={standing.driver.id}
                    className='flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='w-6 text-center font-mono font-bold text-muted-foreground'>
                        {standing.championship.position}
                      </span>
                      <DriverBadge driver={standing.driver} />
                    </div>
                    <span className='font-mono font-bold text-sm'>
                      {standing.championship.points_total}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
