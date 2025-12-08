'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

type TimedSessionCountdownProps = {
  // Sekunden, die der Server als Limit speichert
  timeLimitSeconds: number | null;
};

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function TimedSessionCountdown({
  timeLimitSeconds,
}: TimedSessionCountdownProps) {
  const [remaining, setRemaining] = useState<number>(timeLimitSeconds ?? 0);

  useEffect(() => {
    // Wenn kein Limit gesetzt ist, kein Countdown
    if (!timeLimitSeconds || timeLimitSeconds <= 0) return;

    setRemaining(timeLimitSeconds * 60);

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimitSeconds]);

  return (
    <div className='flex items-center justify-center gap-2'>
      <Clock className='h-4 w-4 text-muted-foreground' />
      <span className='font-mono text-2xl font-bold'>
        {timeLimitSeconds ? formatTime(remaining) : '-'}
      </span>
      <span className='text-muted-foreground'>min</span>
    </div>
  );
}
