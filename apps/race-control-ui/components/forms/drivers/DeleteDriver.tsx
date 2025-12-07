'use client';
import { Button } from '@/components/ui/button';
import { updateDriverAction } from '@/lib/actions/driver.actions';
import { FormState, initialState } from '@/lib/fom.types';
import { Driver } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import React, { useActionState } from 'react';

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
      <Trash2 className='h-4 w-4' />
    </Button>
  );
}

export default DeleteDriver;
