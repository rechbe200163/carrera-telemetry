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
import {
  createMeetingForFunSessionAction,
  createMeetingsForChampioshipAction,
} from '@/lib/actions/meetings.actions';

const AddMeetingsForm = ({
  championshipId,
  isForChampioship = true,
  disabled = false,
}: {
  championshipId?: number;
  isForChampioship?: boolean;
  disabled: boolean;
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [
    forChampionshipFormState,
    forChampionshipAction,
    forChampionshipIsPending,
  ] = useActionState<FormState, FormData>(
    createMeetingsForChampioshipAction.bind(null, championshipId!),
    initialState
  );
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    createMeetingForFunSessionAction,
    initialState
  );

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          {isForChampioship ? 'Nächstes Meeting' : 'Neues Meeting'}
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Neues Meeting</DialogTitle>
          <DialogDescription>
            {isForChampioship
              ? 'Erstelle ein Neues Meeting für die Championship.'
              : 'Erstelle ein Neues Meeting'}
          </DialogDescription>
        </DialogHeader>
        {isForChampioship ? (
          <form action={forChampionshipAction} className='space-y-4 py-4'>
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
              {forChampionshipFormState.errors?.code && (
                <p className='text-sm text-red-500'>
                  {forChampionshipFormState.errors.code.join(', ')}
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
              {forChampionshipFormState.errors?.code && (
                <p className='text-sm text-red-500'>
                  {forChampionshipFormState.errors.code.join(', ')}
                </p>
              )}
            </div>
            {forChampionshipFormState.message && (
              <p
                className={`text-sm ${
                  forChampionshipFormState.success
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {forChampionshipFormState.message}
              </p>
            )}

            <DialogFooter>
              <Button
                variant='outline'
                type='button'
                onClick={() => setIsAddOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                type='submit'
                disabled={forChampionshipIsPending || disabled}
              >
                {forChampionshipIsPending ? 'Speichern…' : 'Meeting anlegen'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form action={action} className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name des Meetings</Label>
              <Input
                id='name'
                name='name'
                placeholder='Test Meeting 1'
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

            <div className='space-y-2'>
              <Label htmlFor='amount'>
                Anzahl der Automatisch zu erstellenten Meetings
              </Label>
              <Input
                id='amount'
                name='amount'
                type='number'
                max={5}
                maxLength={5}
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
              <Button
                variant='outline'
                type='button'
                onClick={() => setIsAddOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Speichern…' : 'Meeting anlegen'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddMeetingsForm;
