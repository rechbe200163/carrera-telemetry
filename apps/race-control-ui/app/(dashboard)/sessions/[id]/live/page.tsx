import LiveTimingComonent from '@/components/live-timing';
import { SessionStopListener } from '@/components/session-stop-listener';
import { getSessionById } from '@/lib/api/session-api.service';
import { getSessionEntriesBySessionId } from '@/lib/api/session-entries-api.service';

export default async function LiveTimingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionById(Number(id));
  const sessionEntries = await getSessionEntriesBySessionId(Number(id));
  return (
    <>
      <LiveTimingComonent session={session} sessionEntries={sessionEntries} />
      <SessionStopListener />
    </>
  );
}
