import DriverStatsComponent from '@/components/driver-stats-component';
import { getDriverById } from '@/lib/api/driver-api.service';
import { getDriverAllTimeStats } from '@/lib/api/statistics-api.service';

async function DriverAllTimeStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getDriverById(Number(id));
  const allTimeStats = await getDriverAllTimeStats(Number(id));
  return (
    <DriverStatsComponent driver={driver} driverAllTimeStats={allTimeStats} />
  );
}

export default DriverAllTimeStatsPage;
