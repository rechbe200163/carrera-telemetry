'use client';

import { useActionState, useEffect } from 'react';
import { FormState, initialState } from '@/lib/fom.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Play, Clock, RotateCcw } from 'lucide-react';
import { startSessionAction } from '@/lib/actions/sessions.actions';
import { SessionType } from '@/lib/types';
import { useRouter } from 'next/navigation';

type StartSessionFormProps = {
  sessionId: string | number;
  sessionType: SessionType;
  hasEntries: boolean;
};

export function StartSessionForm({
  sessionId,
  sessionType,
  hasEntries,
}: StartSessionFormProps) {
  const router = useRouter();
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    startSessionAction.bind(null, Number(sessionId), sessionType),
    initialState
  );
  useEffect(() => {
    if (formState.success) {
      router.push(`/sessions/${sessionId}/live`);
    }
  }, [formState]);

  const isRace = sessionType === 'RACE';

  return (
    <form action={action} className='space-y-4'>
      <div className='space-y-2'>
        {isRace ? (
          <>
            <Label htmlFor='lapLimit' className='flex items-center gap-2'>
              <RotateCcw className='h-4 w-4' />
              Anzahl Runden
            </Label>
            <Input
              id='lapLimit'
              name='lapLimit'
              type='number'
              min={1}
              placeholder='z.B. 71'
              disabled={isPending}
              className='font-mono'
              required
            />
          </>
        ) : (
          <>
            <Label
              htmlFor='durationMinutes'
              className='flex items-center gap-2'
            >
              <Clock className='h-4 w-4' />
              Dauer in Minuten
            </Label>
            <Input
              id='durationMinutes'
              name='durationMinutes'
              type='number'
              min={1}
              placeholder='z.B. 15'
              disabled={isPending}
              className='font-mono'
              required
            />
          </>
        )}
      </div>

      {!hasEntries && (
        <p className='text-xs text-amber-500'>
          Es sind noch keine Fahrer-Controller-Zuordnungen vorhanden. Lege
          zuerst Session Entries an, bevor du die Session startest.
        </p>
      )}

      {formState.message && (
        <p
          className={`text-sm ${
            formState.success ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {formState.message}
        </p>
      )}

      <Button
        type='submit'
        className='w-full'
        disabled={isPending || !hasEntries}
      >
        <Play className='mr-2 h-4 w-4' />
        {isPending ? 'Starte…' : 'Session starten'}
      </Button>
    </form>
  );
}
