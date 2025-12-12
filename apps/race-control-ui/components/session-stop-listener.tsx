'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SessionStopListener() {
  const router = useRouter();

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      return;
    }
    const url = `${baseUrl}/sessions/events`;
    const es = new EventSource(url);

    es.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data) as {
        type: string;
        payload: any;
      };

      if (parsed.type === 'session_stop') {
        // 1) UI reset / Hinweis
        toast('Session gestoppt');

        // 2) optional: live widgets stoppen / states leeren
        // setLiveSession(null), reset laps list, etc.

        // 3) Daten neu ziehen (Server Components / RSC refresh)
        router.refresh();

        // 4) optional: weg navigieren
        router.push(`/sessions/${parsed.payload.sessionId}/results`);
      }
    };

    es.onerror = () => {
      // SSE reconnectet automatisch, aber wenn dein API down ist: close
      // es.close();
    };

    return () => es.close();
  }, [router]);

  return null;
}
