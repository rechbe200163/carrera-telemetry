'use client';
import { Button } from '@/components/ui/button';
import { rebuildSessionResultsAction } from '@/lib/actions/session-results.actions';
import { FormState, initialState } from '@/lib/fom.types';
import { Loader2, RecycleIcon, Trash2 } from 'lucide-react';
import { useActionState } from 'react';

const RebuildSessionResults = ({ sessionId }: { sessionId: number }) => {
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    rebuildSessionResultsAction.bind(null, sessionId),
    initialState
  );

  return (
    <form action={action}>
      <Button
        variant='secondary'
        type='submit'
        formAction={action}
        className='text-foreground'
      >
        {isPending ? (
          <Loader2 className='animate-spin' />
        ) : (
          <>Session Resultate Erneut berechnen</>
        )}
      </Button>
    </form>
  );
};

export default RebuildSessionResults;
