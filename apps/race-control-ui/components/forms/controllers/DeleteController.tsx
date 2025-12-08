'use client';
import { Button } from '@/components/ui/button';
import { deleteControllerAction } from '@/lib/actions/controller.actions';
import { FormState, initialState } from '@/lib/fom.types';
import { Loader2, Trash2 } from 'lucide-react';
import { useActionState } from 'react';

const DeleteController = ({ controllerId }: { controllerId: number }) => {
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    deleteControllerAction.bind(null, controllerId),
    initialState
  );

  return (
    <form action={action}>
      <Button
        variant='ghost'
        size='icon'
        type='submit'
        formAction={action}
        className='text-destructive hover:text-destructive'
      >
        {isPending ? (
          <Loader2 className='animate-spin' />
        ) : (
          <Trash2 className='h-4 w-4' />
        )}
      </Button>
    </form>
  );
};

export default DeleteController;
