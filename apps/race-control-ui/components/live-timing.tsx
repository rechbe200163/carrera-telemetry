'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Circle, Clock, Flag } from 'lucide-react';
import Link from 'next/link';
import { Sessions } from '@/lib/types';
import { SessionTypeBadge } from './session-type-badge';

function formatLapTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
}

function formatSectorTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const seconds = Math.floor(totalSeconds);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
}

export default function LiveTimingComonent({ session }: { session: Sessions }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
                {currentLap}
              </span>
              <span className='text-2xl text-white/40 font-light'>/</span>
              <span className='font-mono text-4xl font-bold text-white/50'>
                {session.lap_limit}
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-3'>
              <Clock className='h-5 w-5 text-white/60' />
              <span className='font-mono text-4xl font-black text-white'>
                {formatElapsed()}
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
        <div className='grid grid-cols-[100px_8px_1fr_180px_180px_120px_120px_100px] gap-2 px-6 py-4 text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] border-b border-white/10'>
          <span>Pos</span>
          <span></span>
          <span>Fahrer</span>
          <span className='text-right'>Letzte Runde</span>
          <span className='text-right'>Beste Runde</span>
          <span className='text-right'>S1</span>
          <span className='text-right'>S2</span>
          <span className='text-right'>Runden</span>
        </div>

        {/* Driver Rows */}
        <div className='divide-y divide-white/5'>
          {liveDriverData.map((entry, idx) => {
            const isLeader = entry.position === 1;
            const hasFastestLap = entry.bestLapTime === fastestLap;
            const isPersonalBest = entry.lastLapTime <= entry.bestLapTime + 100;

            return (
              <div
                key={entry.id}
                className={`grid grid-cols-[100px_8px_1fr_180px_180px_120px_120px_100px] gap-2 items-center px-6 py-5 transition-all duration-300 ${
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

                <div className='text-right'>
                  <span
                    className={`font-mono text-3xl font-black tracking-tight ${isPersonalBest ? 'text-green-400' : 'text-white'}`}
                  >
                    {formatLapTime(entry.lastLapTime)}
                  </span>
                </div>

                <div className='text-right flex items-center justify-end gap-3'>
                  <span
                    className={`font-mono text-3xl font-bold tracking-tight ${hasFastestLap ? 'text-purple-400' : 'text-white/50'}`}
                  >
                    {formatLapTime(entry.bestLapTime)}
                  </span>
                  {hasFastestLap && (
                    <span className='bg-purple-500 text-white text-xs font-black px-2 py-1 rounded'>
                      FL
                    </span>
                  )}
                </div>

                <div className='text-right'>
                  <span className='font-mono text-2xl font-bold text-cyan-400'>
                    {formatSectorTime(entry.s1Time)}
                  </span>
                </div>

                <div className='text-right'>
                  <span className='font-mono text-2xl font-bold text-cyan-400'>
                    {formatSectorTime(entry.s2Time)}
                  </span>
                </div>

                <div className='text-right'>
                  <span className='font-mono text-3xl font-black text-white/70'>
                    {entry.currentLap}
                  </span>
                </div>
              </div>
            );
          })}
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
                  {formatLapTime(fastestLap)}
                </span>
                <span className='bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded border border-purple-500/30'>
                  {leader?.driver.code}
                </span>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
