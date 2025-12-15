import { SessionLapsScatterChart } from '@/components/charts/driver-comparison-session';
import { getSessionById } from '@/lib/api/session-api.service';
import { getLapsForSessionStat } from '@/lib/api/statistics-api.service';

async function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionById(Number(id));
  const chartData = await getLapsForSessionStat(Number(id));
  return (
    <div className='p-5'>
      <SessionLapsScatterChart data={chartData} sessionName={session.name} />
    </div>
  );
}

export default StatsPage;
