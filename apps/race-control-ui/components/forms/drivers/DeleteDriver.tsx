'use client';
import { Button } from '@/components/ui/button';
import { updateDriverAction } from '@/lib/actions/driver.actions';
import { FormState, initialState } from '@/lib/fom.types';
import { Loader2, Trash2 } from 'lucide-react';
import { useActionState } from 'react';

function DeleteDriver({ driverId }: { driverId: number }) {
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    updateDriverAction.bind(null, driverId),
    initialState
  );
  return (
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
  );
}

export default DeleteDriver;
