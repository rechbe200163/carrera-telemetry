'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Waypoints } from 'lucide-react';

type RaceSessionStatusProps = {
  lapLimit: number | null;
  sseUrl?: string; // optional override, sonst Default
};

export function RaceSessionStatus({
  lapLimit,
  sseUrl = 'http://localhost:3333/laps/sse',
}: RaceSessionStatusProps) {
  const [currentLap, setCurrentLap] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(sseUrl);

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (event) => {
      // ⬇️ Hier musst du anpassen, wie dein Backend die Daten schickt
      // Beispiel: { "currentLap": 5 }
      try {
        const data = JSON.parse(event.data);
        if (typeof data.currentLap === 'number') {
          setCurrentLap(data.currentLap);
        }
      } catch {
        // Falls du nur eine Zahl schickst: parseInt als Fallback
        const num = Number(event.data);
        if (!Number.isNaN(num)) {
          setCurrentLap(num);
        }
      }
    };

    es.onerror = () => {
      setConnected(false);
      // Option: es.close(); // wenn du bei Fehler direkt disconnecten willst
    };

    return () => {
      es.close();
    };
  }, [sseUrl]);

  return (
    <div className='flex items-center justify-center gap-3'>
      <Waypoints className='h-4 w-4 text-muted-foreground' />

      <div className='flex flex-col items-center'>
        <span className='font-mono text-2xl font-bold'>
          {currentLap !== null ? currentLap : '-'}
          {lapLimit ? ` / ${lapLimit}` : ''}
        </span>
        <span className='text-xs text-muted-foreground'>Runden</span>
      </div>

      <span className='text-xs text-muted-foreground'>
        {connected ? 'live' : 'offline'}
      </span>
    </div>
  );
}
