import { SelectDriverComponent } from '@/components/select-component';
import SessionLapsStatisticsPage from '@/components/stats/session-laps-stats-driver';
import { getSessionEntriesBySessionId } from '@/lib/api/session-entries-api.service';
import { Drivers } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';
import HeaderComponent from '@/components/helpers/HeaderComponent';

async function LapStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    driverId: string;
  }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const driverId = sp?.driverId ? parseInt(sp.driverId) : null;

  const sessionEntries = await getSessionEntriesBySessionId(Number(id));
  const drivers = Array.from(
    new Map(
      sessionEntries
        .map((se) => se.drivers)
        .filter((d): d is Drivers => Boolean(d))
        .map((d) => [d.id, d])
    ).values()
  );

  const isValidDriverId =
    driverId != null &&
    Number.isFinite(driverId) &&
    drivers.some((d) => d.id === driverId);
  return (
    <div className='p-5 mx-auto container space-y-6'>
      {/* Select ist IMMER da */}
      <HeaderComponent sessionId={Number(id)} />
      <SelectDriverComponent drivers={drivers} />

      {/* 👇 KEIN Fahrer gewählt */}
      {!isValidDriverId && (
        <Card className='bg-card border-border'>
          <CardContent className='py-12'>
            <p className='text-center text-muted-foreground'>
              Wählen Sie einen Fahrer aus, um detaillierte Statistiken
              anzuzeigen
            </p>
          </CardContent>
        </Card>
      )}

      {/* 👇 Fahrer gewählt → Stats */}
      {isValidDriverId && (
        <Suspense fallback={<>...Loading</>}>
          <SessionLapsStatisticsPage
            driverId={driverId}
            sessionId={Number(id)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default LapStatsPage;
