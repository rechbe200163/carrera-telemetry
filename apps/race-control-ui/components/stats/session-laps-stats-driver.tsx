import { BarChart3, TrendingDown, Trophy } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDriverById } from '@/lib/api/driver-api.service';

import { getLapBySessionByDriverId } from '@/lib/api/laps-api.service';

import { LapTimeDisplay } from '../lap-time-display';
import { safeMin } from '@/lib/utils';
import { LapsScatterChart } from '../charts/session-driver-laps-chart';

function hexToRgba(hex: string, alpha: number): string {
  // akzeptiert "#RRGGBB" oder "RRGGBB"
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(255,255,255,${alpha})`;

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default async function SessionLapsStatisticsPage({
  driverId,
  sessionId,
}: {
  driverId: number | null;
  sessionId: number;
}) {
  const isValidDriverId = driverId != null;
  const laps = await getLapBySessionByDriverId(
    Number(sessionId),
    Number(driverId)
  );
  const driver = await getDriverById(Number(driverId));

  // 1) Filter: gültige Runden (und optional Pit-Out raus)
  const validLaps = (laps ?? []).filter((l) => l.is_valid && !l.is_pit_out_lap);

  // 2) Best / Worst / Avg
  const bestLapMs =
    validLaps.length > 0
      ? Math.min(...validLaps.map((l) => l.lap_duration_ms))
      : null;

  const worstLapMs =
    validLaps.length > 0
      ? Math.max(...validLaps.map((l) => l.lap_duration_ms))
      : null;

  const avgLapMs =
    validLaps.length > 0
      ? Math.round(
          validLaps.reduce((sum, l) => sum + l.lap_duration_ms, 0) /
            validLaps.length
        )
      : null;

  // 3) Best Sectors
  const bestS1Ms = safeMin(validLaps.map((l) => l.duration_sector1));
  const bestS2Ms = safeMin(validLaps.map((l) => l.duration_sector2));
  const bestS3Ms = safeMin(validLaps.map((l) => l.duration_sector3));

  // 4) Welche Runde war Best/Worst/Sector-Best?
  const bestLap =
    bestLapMs != null
      ? validLaps.find((l) => l.lap_duration_ms === bestLapMs)
      : null;
  const worstLap =
    worstLapMs != null
      ? validLaps.find((l) => l.lap_duration_ms === worstLapMs)
      : null;

  const bestS1Lap =
    bestS1Ms != null
      ? validLaps.find((l) => l.duration_sector1 === bestS1Ms)
      : null;

  const bestS2Lap =
    bestS2Ms != null
      ? validLaps.find((l) => l.duration_sector2 === bestS2Ms)
      : null;

  const bestS3Lap =
    bestS3Ms != null
      ? validLaps.find((l) => l.duration_sector3 === bestS3Ms)
      : null;

  const driverBg = hexToRgba(driver!.color, 0.08);

  return (
    <div className='container mx-auto space-y-6'>
      {/* Header */}

      {/* Statistics Overview */}
      <div className='grid grid-cols-3 gap-6'>
        {/* Best Lap */}
        <Card
          className='border-2'
          style={{ backgroundColor: driverBg, borderColor: driver!.color }}
        >
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Trophy className='h-4 w-4 text-purple-500' />
              Beste Rundenzeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestLapMs != null ? (
              <LapTimeDisplay timeMs={bestLapMs} size='lg' highlight />
            ) : (
              <p className='text-muted-foreground'>—</p>
            )}
            <p className='text-sm text-muted-foreground mt-2'>
              Runde {bestLap?.lap_number ?? '—'}
            </p>
          </CardContent>
        </Card>

        {/* Average */}
        <Card
          className='border-2'
          style={{ backgroundColor: driverBg, borderColor: driver!.color }}
        >
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-blue-500' />
              Durchschnitt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgLapMs != null ? (
              <LapTimeDisplay timeMs={avgLapMs} size='lg' />
            ) : (
              <p className='text-muted-foreground'>—</p>
            )}
            <p className='text-sm text-muted-foreground mt-2'>
              {validLaps.length} gültige Runden
            </p>
          </CardContent>
        </Card>

        {/* Worst */}
        <Card
          className='border-2'
          style={{ backgroundColor: driverBg, borderColor: driver!.color }}
        >
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <TrendingDown className='h-4 w-4 text-orange-500' />
              Langsamste Runde
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worstLapMs != null ? (
              <LapTimeDisplay timeMs={worstLapMs} size='lg' />
            ) : (
              <p className='text-muted-foreground'>—</p>
            )}
            <p className='text-sm text-muted-foreground mt-2'>
              Runde {worstLap?.lap_number ?? '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Sectors Overview */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-lg'>Beste Sektorenzeiten</CardTitle>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-2 gap-6'>
            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground font-semibold'>
                Sektor 1
              </p>
              {bestS1Ms != null ? (
                <LapTimeDisplay timeMs={bestS1Ms} size='lg' highlight />
              ) : (
                <p className='text-muted-foreground'>—</p>
              )}
              <p className='text-xs text-muted-foreground'>
                Runde {bestS1Lap?.lap_number ?? '—'}
              </p>
            </div>

            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground font-semibold'>
                Sektor 2
              </p>
              {bestS2Ms != null ? (
                <LapTimeDisplay timeMs={bestS2Ms} size='lg' highlight />
              ) : (
                <p className='text-muted-foreground'>—</p>
              )}
              <p className='text-xs text-muted-foreground'>
                Runde {bestS2Lap?.lap_number ?? '—'}
              </p>
            </div>

            {bestS3Ms && (
              <div className='text-center space-y-2'>
                <p className='text-sm text-muted-foreground font-semibold'>
                  Sektor 3
                </p>
                <LapTimeDisplay timeMs={bestS3Ms} size='lg' highlight />
                <p className='text-xs text-muted-foreground'>
                  Runde {bestS3Lap?.lap_number ?? '—'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <LapsScatterChart laps={laps} driver={driver} />

      {/* All Laps Table */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-lg'>
            Alle Runden mit Sektorenzeiten
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className='space-y-1'>
            <div className='grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-4 px-4 py-3 bg-muted/50 rounded-t-lg text-sm font-semibold sticky top-0'>
              <span>Runde</span>
              <span className='text-center'>Sektor 1</span>
              <span className='text-center'>Sektor 2</span>
              <span className='text-center'>Rundenzeit</span>
              <span className='text-center'>Delta</span>
            </div>

            <div className='max-h-[600px] overflow-y-auto space-y-1'>
              {laps!.map((lap) => {
                const isInvalid = !lap.is_valid || lap.is_pit_out_lap;
                const isBestLap =
                  bestLapMs != null && lap.lap_duration_ms === bestLapMs;
                const isWorstLap =
                  worstLapMs != null && lap.lap_duration_ms === worstLapMs;

                const deltaMs =
                  bestLapMs != null ? lap.lap_duration_ms - bestLapMs : null;

                const rowBg = !isBestLap && !isInvalid ? driverBg : undefined;

                return (
                  <div
                    key={lap.id}
                    className={`grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-4 px-4 py-3 rounded items-center ${
                      isBestLap
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : isInvalid
                          ? 'bg-red-500/10 border border-red-500/30'
                          : 'hover:bg-muted/50'
                    }`}
                    style={rowBg ? { backgroundColor: rowBg } : undefined}
                  >
                    <span className='font-mono font-bold text-base flex items-center gap-2'>
                      {lap.lap_number}
                      {isInvalid ? (
                        <span className='text-red-500 text-xs'>(X)</span>
                      ) : null}
                    </span>

                    <span className='font-mono text-sm text-center'>
                      {lap.duration_sector1 != null ? (
                        <LapTimeDisplay
                          timeMs={lap.duration_sector1}
                          highlight={
                            bestS1Ms != null &&
                            lap.duration_sector1 === bestS1Ms
                          }
                          size='sm'
                        />
                      ) : (
                        '—'
                      )}
                    </span>

                    <span className='font-mono text-sm text-center'>
                      {lap.duration_sector2 != null ? (
                        <LapTimeDisplay
                          timeMs={lap.duration_sector2}
                          highlight={
                            bestS2Ms != null &&
                            lap.duration_sector2 === bestS2Ms
                          }
                          size='sm'
                        />
                      ) : (
                        '—'
                      )}
                    </span>

                    <span
                      className={`font-mono font-bold text-center ${isBestLap ? 'text-2xl' : 'text-base'}`}
                    >
                      <LapTimeDisplay
                        timeMs={lap.lap_duration_ms}
                        highlight={isBestLap}
                        size={isBestLap ? 'lg' : 'default'}
                      />
                      {isBestLap ? (
                        <Trophy className='inline ml-2 h-4 w-4 text-purple-500' />
                      ) : null}
                    </span>

                    <span className='text-center'>
                      {deltaMs == null ? (
                        <span className='text-muted-foreground font-mono text-sm'>
                          —
                        </span>
                      ) : deltaMs === 0 ? (
                        <span className='text-purple-500 font-mono text-sm font-bold'>
                          BEST
                        </span>
                      ) : isWorstLap ? (
                        <span className='text-orange-500 font-mono text-sm font-bold'>
                          +{(deltaMs / 1000).toFixed(3)}
                        </span>
                      ) : deltaMs < 500 ? (
                        <span className='text-green-500 font-mono text-sm font-bold'>
                          +{(deltaMs / 1000).toFixed(3)}
                        </span>
                      ) : (
                        <span className='text-muted-foreground font-mono text-sm'>
                          +{(deltaMs / 1000).toFixed(3)}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
