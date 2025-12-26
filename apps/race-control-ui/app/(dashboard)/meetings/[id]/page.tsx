import { getMeetingById } from '@/lib/api/meetings-api.service';
import { getChampionshipByMeetingId } from '@/lib/api/championship-api.service';
import { getSessionsByMeetingId } from '@/lib/api/session-api.service';
import SessionCardComponent from '@/components/helpers/SessionCardComponent';
import { AddSession } from '@/components/forms/sessions/add-session';

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

  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 mb-1'>
            <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 font-mono text-lg font-bold text-primary'>
              R{meeting.round_number}
            </span>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {meeting.name}
              </h1>
              <p className='text-muted-foreground'>
                {championship && (
                  <>
                    {championship.name} · Runde {meeting.round_number}
                  </>
                )}
              </p>
            </div>
          </div>
          {meeting && meeting.championship_id === null && (
            <AddSession meetingId={meeting.id} />
          )}
        </div>

        {/* Sessions Grid */}
        <div>
          <h2 className='text-lg font-semibold mb-4'>Sessions</h2>
          <div className='grid gap-4 md:grid-cols-3'>
            {sessions.map((session) => (
              <SessionCardComponent key={session.id} session={session} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
