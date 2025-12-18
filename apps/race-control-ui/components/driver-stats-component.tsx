import {
  ArrowLeft,
  Clock,
  Flag,
  Gauge,
  LucideHash,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { LapTimeDisplay } from './lap-time-display';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DriverBadge } from './driver-badge';
import { Button } from './ui/button';
import Link from 'next/link';
import { DriverAllTimeStats, Drivers } from '@/lib/types';

export default function DriverStatsComponent({
  driver,
  driverAllTimeStats,
}: {
  driver: Drivers;
  driverAllTimeStats: DriverAllTimeStats;
}) {
  if (!driver) {
    return (
      <div className='flex flex-col'>
        <div className='p-6'>
          <Card className='bg-card border-border'>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <p className='text-muted-foreground mb-4'>
                Fahrer nicht gefunden
              </p>
              <Button asChild>
                <Link href='/drivers'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Zurück zu Drivers
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' asChild>
              <Link href='/drivers'>
                <ArrowLeft className='h-5 w-5' />
              </Link>
            </Button>
            <div
              className='h-16 w-2 rounded-full'
              style={{ backgroundColor: driver.color }}
            />
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                {driver.first_name} {driver.last_name}
              </h1>
              <p className='text-muted-foreground font-mono text-lg'>
                {driver.code}
              </p>
            </div>
          </div>
          <DriverBadge driver={driver} size='lg' />
        </div>
        {/* Overview Stats */}
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-5'>
          <Card className='bg-card border-border'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/20'>
                  <Trophy className='h-6 w-6 text-yellow-500' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Siege</p>
                  <p className='text-3xl font-bold font-mono'>
                    {driverAllTimeStats.wins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20'>
                  <Target className='h-6 w-6 text-orange-500' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    2 Platzierungen
                  </p>
                  <p className='text-3xl font-bold font-mono'>
                    {driverAllTimeStats.p2_finishes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20'>
                  <LucideHash className='h-6 w-6 text-orange-500' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    3 Platzierungen
                  </p>
                  <p className='text-3xl font-bold font-mono'>
                    {driverAllTimeStats.p3_finishes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20'>
                  <Flag className='h-6 w-6 text-cyan-500' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Sessions</p>
                  <p className='text-3xl font-bold font-mono'>
                    {driverAllTimeStats.sessions_total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20'>
                  <TrendingUp className='h-6 w-6 text-green-500' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Gesamte Runden
                  </p>
                  <p className='text-3xl font-bold font-mono'>
                    {driverAllTimeStats.laps_total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Timing Stats */}
        <div className='grid gap-4 md:grid-cols-2'>
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Clock className='h-4 w-4' />
                Rundenzeiten
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between rounded-lg bg-purple-500/10 p-4 border border-purple-500/30'>
                <span className='text-sm text-muted-foreground'>
                  Beste Runde
                </span>
                {driverAllTimeStats.best_lap_ms ? (
                  <LapTimeDisplay
                    timeMs={driverAllTimeStats.best_lap_ms}
                    highlight
                  />
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )}
              </div>
              <div className='flex items-center justify-between rounded-lg bg-secondary/50 p-4'>
                <span className='text-sm text-muted-foreground'>
                  Durchschnitt
                </span>
                {driverAllTimeStats.avg_lap_ms ? (
                  <LapTimeDisplay
                    timeMs={driverAllTimeStats.avg_lap_ms}
                    size='sm'
                  />
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )}
              </div>
              {driverAllTimeStats.stddev_lap_ms && (
                <div className='flex items-center justify-between rounded-lg bg-secondary/50 p-4'>
                  <span className='text-sm text-muted-foreground'>
                    Consistency (σ)
                  </span>
                  <span className='font-mono text-xl'>
                    ±{(driverAllTimeStats.stddev_lap_ms / 1000).toFixed(3)}s
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Gauge className='h-4 w-4' />
                Beste Sektoren
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between rounded-lg bg-cyan-500/10 p-4 border border-cyan-500/30'>
                <span className='text-sm text-muted-foreground'>Sektor 1</span>
                {driverAllTimeStats.best_s1_ms ? (
                  <LapTimeDisplay timeMs={driverAllTimeStats.best_s1_ms} />
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )}
              </div>
              <div className='flex items-center justify-between rounded-lg bg-cyan-500/10 p-4 border border-cyan-500/30'>
                <span className='text-sm text-muted-foreground'>Sektor 2</span>
                {driverAllTimeStats.best_s2_ms ? (
                  <LapTimeDisplay timeMs={driverAllTimeStats.best_s2_ms} />
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )}
              </div>
              {driverAllTimeStats.theoretical_best_ms && (
                <div className='flex items-center justify-between rounded-lg bg-purple-500/10 p-4 border border-purple-500/30'>
                  <span className='text-sm text-muted-foreground'>
                    Theoretische Beste
                  </span>
                  <LapTimeDisplay
                    timeMs={driverAllTimeStats.theoretical_best_ms}
                    highlight
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Recent Sessions
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-base'>Letzte Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className='space-y-3'>
                {recentSessions.map((entry, idx) => {
                  const meeting = mockMeetings.find(
                    (m) => m.id === entry.session?.meetingId
                  );
                  const entryBestLap = entry.lapTimes
                    ?.filter((l) => l.isValid)
                    .map((l) => l.lapTime);
                  const sessionBest =
                    entryBestLap && entryBestLap.length > 0
                      ? Math.min(...entryBestLap)
                      : null;

                  return (
                    <div
                      key={idx}
                      className='flex items-center justify-between rounded-lg bg-secondary/30 p-4'
                    >
                      <div className='flex items-center gap-4'>
                        {entry.position && (
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono font-bold text-lg ${
                              entry.position === 1
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : entry.position === 2
                                  ? 'bg-gray-400/20 text-gray-400'
                                  : entry.position === 3
                                    ? 'bg-orange-600/20 text-orange-600'
                                    : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            P{entry.position}
                          </div>
                        )}
                        <div>
                          <div className='flex items-center gap-2'>
                            {entry.session && (
                              <SessionTypeBadge type={entry.session.type} />
                            )}
                            <span className='font-medium'>
                              {meeting?.name || 'Unknown'}
                            </span>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {entry.lapTimes?.length || 0} Runden
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        {sessionBest && (
                          <div>
                            <p className='text-xs text-muted-foreground'>
                              Beste Runde
                            </p>
                            <LapTimeDisplay
                              time={sessionBest}
                              className='text-lg'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className='text-center text-muted-foreground py-8'>
                Keine Sessions vorhanden
              </p>
            )} 
          </CardContent>
        </Card>
             */}
      </div>
    </div>
  );
}
