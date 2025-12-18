'use client';
import { Button } from '@/components/ui/button';
import { deleteSessionEntriesAction } from '@/lib/actions/session-entries.actions';
import { FormState, initialState } from '@/lib/fom.types';
import { Loader2, Trash2 } from 'lucide-react';
import { useActionState } from 'react';

function DeleteSessionEntries({
  controllerAddress,
  sessionId,
}: {
  controllerAddress: number;
  sessionId: number;
}) {
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    deleteSessionEntriesAction.bind(null, controllerAddress, sessionId),
    initialState
  );
  return (
    <form action={action}>
      <Button
        variant='ghost'
        size='icon'
        type='submit'
        className='text-destructive hover:text-destructive'
        onClick={() => console.log('deleted')}
      >
        {isPending ? (
          <Loader2 className='animate-spin' />
        ) : (
          <Trash2 className='h-4 w-4' />
        )}
      </Button>
    </form>
  );
}

export default DeleteSessionEntries;
