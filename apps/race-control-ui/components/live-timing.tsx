'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Circle, Clock, Flag } from 'lucide-react';
import Link from 'next/link';
import { SessionEntries, Sessions } from '@/lib/types';
import { FinishSessionForm } from './forms/sessions/finish-session';

type DriverRuntimeState = {
  driverId: number;
  controllerAddress: number;
  lapsCompleted: number;
  currentLap: number;
  lastLapMs: number | null;
  bestLapMs: number | null;
  sector1Ms: number | null;
  sector2Ms: number | null;
  totalTimeMs: number;
  gapToLeaderMs: number | null;
};

type SessionRuntimeSnapshot = {
  sessionId: number;
  updatedAt: string;

  startedAt: string | null;
  timeLimitSeconds: number | null;

  drivers: DriverRuntimeState[];
};

type LiveDriverRow = {
  id: string;
  position: number;
  lastLapTime: number | null;
  bestLapTime: number | null;
  s1Time: number | null;
  s2Time: number | null;

  // beide behalten, sonst wirst du später wahnsinnig
  currentLap: number; // laufende Runde (lapsCompleted + 1)
  lapsCompleted: number; // fertige Runden

  gapToLeaderMs: number | null;
  driver: {
    code: string;
    name: string;
    teamColor: string;
  };
};

function formatLapTime(ms: number | null | undefined): string {
  if (ms == null) return '-';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(3, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
}

function formatSectorTime(ms: number | null | undefined): string {
  if (ms == null) return '-';
  const totalSeconds = ms / 1000;
  const seconds = Math.floor(totalSeconds);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
}

function formatGap(ms: number | null | undefined): string {
  if (ms == null) return '-';
  if (ms === 0) return 'LDR';
  const sign = ms > 0 ? '+' : '-';
  return `${sign}${formatLapTime(Math.abs(ms))}`;
}

function formatCountdown(ms: number | null): string {
  if (ms == null) return '--:--';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LiveTimingComonent({
  session,
  sessionEntries,
}: {
  session: Sessions;
  sessionEntries: SessionEntries[];
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [snapshot, setSnapshot] = useState<SessionRuntimeSnapshot | null>(null);

  // UI Clock + local "now" (Countdown basiert auf startedAt + timeLimitSeconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setNowMs(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Live-Daten via SSE holen
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      return;
    }

    const url = `${baseUrl}/live/sessions/${session.id}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SessionRuntimeSnapshot;
        setSnapshot(data);
      } catch (err) {
        console.error('Failed to parse SSE data', err);
      }
    };

    es.onerror = (err) => {
      console.error('SSE error', err);
      // Verbindung absichtlich offen lassen; Browser reconnectet.
    };

    return () => {
      es.close();
    };
  }, [session.id]);

  // Countdown für Practice/Qualy/Fun (server-startedAt + server-timeLimitSeconds)
  const remainingMs = useMemo(() => {
    if (session.session_type === 'RACE') return null;
    if (!snapshot?.startedAt) return null;
    if (snapshot.timeLimitSeconds == null) return null;

    const started = Date.parse(snapshot.startedAt);
    const durationMs = snapshot.timeLimitSeconds * 1000;
    const elapsed = Math.max(0, nowMs - started);
    return Math.max(0, durationMs - elapsed);
  }, [
    session.session_type,
    snapshot?.startedAt,
    snapshot?.timeLimitSeconds,
    nowMs,
  ]);

  // Mappe RuntimeSnapshot + Session-Metadaten -> UI-Row Model
  const liveDriverData: LiveDriverRow[] = useMemo(() => {
    if (!snapshot) return [];

    const entries = sessionEntries ?? [];

    return snapshot.drivers.map((d, index) => {
      const entry =
        entries.find(
          (e: any) =>
            e.driver_id === d.driverId ||
            e.controller_address === d.controllerAddress
        ) ?? null;

      const driverInfo =
        (entry as any)?.driver ??
        (entry as any)?.drivers ??
        (entry as any) ??
        {};

      const rawName =
        driverInfo.name ??
        ([driverInfo.first_name, driverInfo.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() ||
          '');

      const code =
        driverInfo.code ??
        (rawName
          ? rawName
              .split(' ')
              .map((p: string) => p[0])
              .join('')
              .toUpperCase()
          : `D${d.driverId}`);

      const name = rawName || `Driver ${d.driverId}`;
      const teamColor = driverInfo.team_color ?? '#ffffff';

      return {
        id: `${d.driverId}-${d.controllerAddress}`,
        position: index + 1,
        lastLapTime: d.lastLapMs,
        bestLapTime: d.bestLapMs,
        s1Time: d.sector1Ms,
        s2Time: d.sector2Ms,

        // FIX: nicht lapsCompleted reinwerfen
        currentLap: d.currentLap,
        lapsCompleted: d.lapsCompleted,

        gapToLeaderMs: d.gapToLeaderMs,
        driver: { code, name, teamColor },
      };
    });
  }, [snapshot, sessionEntries]);

  const leader = liveDriverData[0] ?? null;

  const fastestLap = useMemo(() => {
    let best: number | null = null;
    for (const d of liveDriverData) {
      if (d.bestLapTime == null) continue;
      if (best == null || d.bestLapTime < best) best = d.bestLapTime;
    }
    return best ?? 0;
  }, [liveDriverData]);

  const currentLapHeader = leader?.currentLap ?? 0;

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white flex flex-col'>
      {/* Top Header Bar */}
      <header className='bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border-b-2 border-red-600 px-8 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-6'>
          <Button
            variant='ghost'
            size='sm'
            asChild
            className='text-muted-foreground hover:text-white'
          >
            <Link href={`/sessions/${session.id}`}>
              <ArrowLeft className='h-5 w-5' />
            </Link>
          </Button>

          {/* STOP / FINISH Button */}
          <div className='min-w-[220px]'>
            <FinishSessionForm session={session} />
          </div>
        </div>

        <div className='flex items-center gap-8'>
          {/* Live Indicator */}
          <div className='flex items-center gap-2 bg-red-600 rounded px-4 py-2 shadow-lg shadow-red-600/30'>
            <Circle className='h-3 w-3 animate-pulse fill-white text-white' />
            <span className='text-sm font-black text-white tracking-widest'>
              LIVE
            </span>
          </div>

          {/* Session Progress */}
          {session.session_type === 'RACE' ? (
            <div className='flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-3'>
              <Flag className='h-5 w-5 text-white/60' />
              <span className='font-mono text-4xl font-black text-white'>
                {currentLapHeader}
              </span>
              <span className='text-2xl text-white/40 font-light'>/</span>
              <span className='font-mono text-4xl font-bold text-white/50'>
                {session.lap_limit ?? '-'}
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-3'>
              <Clock className='h-5 w-5 text-white/60' />
              <span className='font-mono text-4xl font-black text-white'>
                {formatCountdown(remainingMs)}
              </span>
            </div>
          )}

          {/* Current Time */}
          <div className='text-right'>
            <p className='text-[10px] text-muted-foreground uppercase tracking-widest'>
              Uhrzeit
            </p>
            <p className='font-mono text-2xl font-bold'>
              {currentTime.toLocaleTimeString('de-DE')}
            </p>
          </div>
        </div>
      </header>

      {/* Main Timing Tower */}
      <main className='flex-1 px-8 py-6'>
        {/* Column Headers */}
        <div className='grid grid-cols-[100px_8px_1fr_180px_180px_120px_120px_120px_100px] gap-2 px-6 py-4 text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] border-b border-white/10'>
          <span>Pos</span>
          <span></span>
          <span>Fahrer</span>
          <span className='text-right'>Letzte Runde</span>
          <span className='text-right'>Beste Runde</span>
          <span className='text-right'>S1</span>
          <span className='text-right'>S2</span>
          <span className='text-right'>Gap</span>
          <span className='text-right'>Runden</span>
        </div>

        {/* Driver Rows */}
        <div className='divide-y divide-white/5'>
          {liveDriverData.map((entry) => {
            const isLeader = entry.position === 1;
            const hasFastestLap =
              entry.bestLapTime != null &&
              fastestLap !== 0 &&
              entry.bestLapTime === fastestLap;
            const isPersonalBest =
              entry.lastLapTime != null &&
              entry.bestLapTime != null &&
              entry.lastLapTime <= entry.bestLapTime + 100;

            return (
              <div
                key={entry.id}
                className={`grid grid-cols-[100px_8px_1fr_180px_180px_120px_120px_120px_100px] gap-2 items-center px-6 py-5 transition-all duration-300 ${
                  isLeader
                    ? 'bg-gradient-to-r from-yellow-500/10 to-transparent'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Position */}
                <div className='flex items-center'>
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center font-mono text-4xl font-black ${
                      entry.position === 1
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                        : entry.position === 2
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                          : entry.position === 3
                            ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                            : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {entry.position}
                  </div>
                </div>

                {/* Team Color Bar */}
                <div
                  className='w-2 h-16 rounded-full shadow-lg'
                  style={{
                    backgroundColor: entry.driver.teamColor,
                    boxShadow: `0 0 20px ${entry.driver.teamColor}40`,
                  }}
                />

                {/* Driver Info */}
                <div className='flex flex-col gap-1 pl-4'>
                  <span className='font-mono text-4xl font-black tracking-wider'>
                    {entry.driver.code}
                  </span>
                  <span className='text-base text-white/50'>
                    {entry.driver.name}
                  </span>
                </div>

                {/* Last Lap */}
                <div className='text-right'>
                  <span
                    className={`font-mono text-3xl font-black tracking-tight ${
                      isPersonalBest ? 'text-green-400' : 'text-white'
                    }`}
                  >
                    {formatLapTime(entry.lastLapTime)}
                  </span>
                </div>

                {/* Best Lap */}
                <div className='text-right flex items-center justify-end gap-3'>
                  <span
                    className={`font-mono text-3xl font-bold tracking-tight ${
                      hasFastestLap ? 'text-purple-400' : 'text-white/50'
                    }`}
                  >
                    {formatLapTime(entry.bestLapTime)}
                  </span>
                  {hasFastestLap && (
                    <span className='bg-purple-500 text-white text-xs font-black px-2 py-1 rounded'>
                      FL
                    </span>
                  )}
                </div>

                {/* Sector 1 */}
                <div className='text-right'>
                  <span className='font-mono text-2xl font-bold text-cyan-400'>
                    {formatSectorTime(entry.s1Time)}
                  </span>
                </div>

                {/* Sector 2 */}
                <div className='text-right'>
                  <span className='font-mono text-2xl font-bold text-cyan-400'>
                    {formatSectorTime(entry.s2Time)}
                  </span>
                </div>

                {/* Gap */}
                <div className='text-right'>
                  <span className='font-mono text-2xl font-bold text-white/70'>
                    {formatGap(entry.gapToLeaderMs)}
                  </span>
                </div>

                {/* Laps Completed */}
                <div className='text-right'>
                  <span className='font-mono text-3xl font-black text-white/70'>
                    {entry.lapsCompleted}
                  </span>
                </div>
              </div>
            );
          })}

          {liveDriverData.length === 0 && (
            <div className='px-6 py-10 text-center text-sm text-white/40'>
              Noch keine Live-Daten empfangen – warte auf erste Runden…
            </div>
          )}
        </div>
      </main>

      {/* Footer with stats and legend */}
      <footer className='bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border-t border-white/10 px-8 py-5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-12'>
            <div>
              <p className='text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1'>
                Schnellste Runde
              </p>
              <div className='flex items-center gap-3'>
                <span className='font-mono text-3xl text-purple-400 font-black'>
                  {fastestLap ? formatLapTime(fastestLap) : '-'}
                </span>
                {leader && (
                  <span className='bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded border border-purple-500/30'>
                    {leader.driver.code}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className='text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1'>
                Führender
              </p>
              <p className='font-mono text-3xl font-black'>
                {leader?.driver.code || '-'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-6 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='w-4 h-4 rounded bg-green-400'></span>
              <span className='text-white/60'>Personal Best</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-4 h-4 rounded bg-purple-400'></span>
              <span className='text-white/60'>Fastest Lap</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-4 h-4 rounded bg-cyan-400'></span>
              <span className='text-white/60'>Sektor Zeit</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-4 h-4 rounded bg-white/60'></span>
              <span className='text-white/60'>Gap zum Leader</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
