import { Button } from '@/components/ui/button';
import { deleteControllerAction } from '@/lib/actions/controller.actions';
import { updateDriverAction } from '@/lib/actions/driver.actions';
import { FormState, initialState } from '@/lib/fom.types';
import { Trash2 } from 'lucide-react';
import React, { useActionState } from 'react';

const DeleteController = ({ driverId }: { driverId: number }) => {
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    deleteControllerAction.bind(null, driverId),
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
};

export default DeleteController;
