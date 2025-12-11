'use client';

import { useEffect, useState } from 'react';
import { Waypoints } from 'lucide-react';
import { ENDPOINTS } from '@/lib/enpoints';

type RaceSessionStatusProps = {
  lapLimit: number | null;
  sessionId: number;
  sseUrl?: string; // optional override, sonst Default
};

export function RaceSessionStatus({
  lapLimit,
  sessionId,
}: RaceSessionStatusProps) {
  const sseUrl = ENDPOINTS.LAPS.LIVE_LAPS(sessionId);
  const [currentLap, setCurrentLap] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(sseUrl);

    es.onopen = () => {
      setConnected(true);
      console.log('connected');
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
      console.log('event', event);
    };

    es.onerror = (error) => {
      setConnected(false);
      // Option: es.close(); // wenn du bei Fehler direkt disconnecten willst
      console.log(error);
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
        {connected ? 'live is live' : 'na na na na na'}
      </span>
    </div>
  );
}
