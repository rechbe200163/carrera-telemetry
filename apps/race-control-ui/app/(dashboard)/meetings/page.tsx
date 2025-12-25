import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getAllSessions } from '@/lib/api/session-api.service';
import { getAllMeetings } from '@/lib/api/meetings-api.service';
import { getAllChampionships } from '@/lib/api/championship-api.service';
import { StatusBadge } from '@/components/status-badge';
import AddMeetingsForm from '@/components/forms/meetings/AddMeeting';

export default async function MeetingsPage() {
  const sessions = await getAllSessions();
  const meetings = await getAllMeetings();
  const championships = await getAllChampionships();

  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Meetings</h1>
            <p className='text-muted-foreground'>
              Alle Rennwochenenden im Überblick
            </p>
          </div>
          <AddMeetingsForm isForChampioship={false} disabled={false} />
        </div>

        {/* Meetings List */}
        <div className='space-y-4'>
          {meetings.map((meeting) => {
            const championship = championships.find(
              (c) => c.id === meeting.championship_id
            );
            return (
              <Card
                key={meeting.id}
                className='bg-card border-border hover:border-primary/50 transition-colors'
              >
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-secondary'>
                        <span className='text-xs text-muted-foreground'>
                          Round
                        </span>
                        <span className='font-mono text-xl font-bold'>
                          {meeting.round_number}
                        </span>
                      </div>
                      <div>
                        <h3 className='font-semibold'>{meeting.name}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {championship?.name} · Season {championship?.season}
                        </p>
                        <div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
                          <Calendar className='h-3 w-3' />
                          {meeting.start_date + '' || 'Datum TBD'}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <StatusBadge status={meeting.status} />
                      <Button variant='secondary' asChild>
                        <Link href={`/meetings/${meeting.id}`}>
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
