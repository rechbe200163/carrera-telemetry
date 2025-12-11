import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CircleSlash2, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { SessionTypeBadge } from '@/components/session-type-badge';
import { getSessionResultsBySessionId } from '@/lib/api/session-resutls-api.service';
import { getSessionById } from '@/lib/api/session-api.service';
import { DriverBadge } from '@/components/driver-badge';
import { LapTimeDisplay } from '@/components/lap-time-display';

export default async function SessionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionById(Number(id));
  const sessionResults = await getSessionResultsBySessionId(Number(id));

  console.log(sessionResults);

  const getPodiumStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 2:
        return 'bg-slate-400/20 border-slate-400/50 text-slate-300';
      case 3:
        return 'bg-orange-700/20 border-orange-700/50 text-orange-500';
      default:
        return 'bg-secondary/30 border-transparent text-muted-foreground';
    }
  };

  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' asChild>
              <Link href={`/sessions/${id}`}>
                <ArrowLeft className='h-4 w-4' />
              </Link>
            </Button>
            <SessionTypeBadge type={session.session_type} size='lg' />
            {/* <div>
              <h1 className='text-2xl font-bold tracking-tight'>Ergebnisse</h1>
              <p className='text-muted-foreground'>
                {meeting?.name} · {championship?.name}
              </p>
            </div> */}
          </div>
        </div>

        {/* Results Table */}
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Trophy className='h-4 w-4 text-primary' />
              Klassifizierung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {sessionResults.map((result) => (
                <div
                  key={result.driver_id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${getPodiumStyle(result.position)}`}
                >
                  <div className='flex items-center gap-4'>
                    <span
                      className={`w-10 text-center font-mono text-2xl font-bold ${
                        result.position <= 3 ? '' : 'text-muted-foreground'
                      }`}
                    >
                      {result.position}
                    </span>
                    <DriverBadge driver={result.drivers!} showName size='lg' />
                    {result.points_fastest_lap === 1 && (
                      <div className='flex items-center gap-1 rounded bg-quali/20 px-2 py-0.5 text-xs text-quali'>
                        <Zap className='h-3 w-3' />
                        Fastest Lap
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-8'>
                    <div className='text-right min-w-16'>
                      <p className='text-xs text-muted-foreground'>Runden</p>
                      <p className='font-mono font-bold'>
                        {result.laps_completed}
                      </p>
                    </div>
                    <div className='text-right min-w-24'>
                      <p className='text-xs text-muted-foreground'>
                        Beste Runde
                      </p>
                      <LapTimeDisplay
                        timeMs={result.best_lap_ms!}
                        highlight={result.points_fastest_lap === 1}
                      />
                    </div>
                    <div className='text-right min-w-24'>
                      <p className='text-xs text-muted-foreground'>
                        Durschnits Runde
                      </p>
                      <LapTimeDisplay timeMs={result.avg_lap_ms!} />
                    </div>
                    <div className='text-right min-w-20'>
                      <p className='text-xs text-muted-foreground'>Punkte</p>
                      <p className='font-mono text-lg font-bold'>
                        {result.points_total}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
