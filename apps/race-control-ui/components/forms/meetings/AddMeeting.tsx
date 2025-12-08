'use client';

import { useActionState, useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { FormState, initialState } from '@/lib/fom.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';
import { createMeetingsAction } from '@/lib/actions/meetings.actions';

const AddMeetingsForm = ({ championshipId }: { championshipId: number }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    createMeetingsAction.bind(null, championshipId),
    initialState
  );

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Nächstes Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Neue Meeting</DialogTitle>
          <DialogDescription>
            Erstelle ein Neues Meeting für die Championship.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name der Runde</Label>
            <Input
              id='name'
              name='name'
              placeholder='Weihnachtsferien Runde 1'
              defaultValue=''
              disabled={isPending}
              required
            />
            {formState.errors?.code && (
              <p className='text-sm text-red-500'>
                {formState.errors.code.join(', ')}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='date'>Start Datum des Meetings</Label>
            <Input
              id='date'
              name='date'
              type='datetime-local'
              disabled={isPending}
            />
            {formState.errors?.code && (
              <p className='text-sm text-red-500'>
                {formState.errors.code.join(', ')}
              </p>
            )}
          </div>
          {formState.message && (
            <p
              className={`text-sm ${
                formState.success ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formState.message}
            </p>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddOpen(false)}>
              Abbrechen
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Speichern…' : 'Meeting anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMeetingsForm;
