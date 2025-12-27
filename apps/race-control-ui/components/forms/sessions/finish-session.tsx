'use client';

import { useActionState } from 'react';
import { FormState, initialState } from '@/lib/fom.types';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { finishSessionAction } from '@/lib/actions/sessions.actions';
import { Sessions, Status } from '@/lib/types';

type StartSessionFormProps = {
  session: Sessions;
};

export function FinishSessionForm({ session }: StartSessionFormProps) {
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    finishSessionAction.bind(null, Number(session.id)),
    initialState
  );

  const isFinishable = session?.status === Status.LIVE;

  return (
    <form action={action} className='space-y-4'>
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
        disabled={isPending || !isFinishable}
      >
        <Pause className='mr-2 h-4 w-4' />
        {isPending ? 'Stoppen' : 'Session stoppen'}
      </Button>
    </form>
  );
}
