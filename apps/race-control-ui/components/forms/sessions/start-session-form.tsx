'use client';

import { useActionState, useEffect, useState } from 'react';
import { FormState, initialState } from '@/lib/fom.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Play, Clock, RotateCcw } from 'lucide-react';
import { startSessionAction } from '@/lib/actions/sessions.actions';
import { SessionType } from '@/lib/types';

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
  const [error, setError] = useState<Record<string, string[]> | null>(null);
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    startSessionAction.bind(null, Number(sessionId), sessionType),
    initialState
  );

  useEffect(() => {
    if (formState.errors) {
      setError(formState.errors ?? null);
    }
  }, [formState.errors]);

  const isRace = sessionType === SessionType.RACE;
  const isTimed =
    sessionType === SessionType.PRACTICE ||
    sessionType === SessionType.QUALYFING;
  const isFun = sessionType === SessionType.FUN;

  return (
    <form action={action} className='space-y-4'>
      <div className='space-y-2'>
        <div className='space-y-3'>
          {/* Inputs */}
          {isTimed && (
            <div className='space-y-2'>
              <div className='text-sm font-medium'>Dauer in Minuten</div>
              <Input
                name='durationMinutes'
                type='number'
                min={1}
                max={240}
                placeholder='z. B. 15'
              />
            </div>
          )}

          {isRace && (
            <div className='space-y-2'>
              <div className='text-sm font-medium'>Rundenlimit</div>
              <Input
                name='lapLimit'
                type='number'
                min={1}
                max={999}
                placeholder='z. B. 30'
              />
            </div>
          )}

          {isFun && (
            <div className='rounded-lg border border-border bg-secondary/20 p-3 text-sm text-muted-foreground'>
              Test / Setup Session - kein Zeit- oder Rundenlimit. Du beendest
              sie manuell.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className='text-sm text-destructive'>
              {Object.entries(error).map(([field, msgs]) => (
                <div key={field}>
                  <b>{field}:</b> {msgs.join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>
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
