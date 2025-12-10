'use client';

import { useActionState, useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { createDriverAction } from '@/lib/actions/driver.actions';
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
import { createChampionshipAction } from '@/lib/actions/championsship.actions';

const AddChampionshipForm = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    createChampionshipAction,
    initialState
  );

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Neue Championship
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Neuer Fahrer</DialogTitle>
          <DialogDescription>
            Erstelle eine neue Championship für das System.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>Name</Label>
            <Input
              id='name'
              name='name'
              placeholder='WM 2025'
              defaultValue=''
              disabled={isPending}
            />
            {formState.errors?.name && (
              <p className='text-sm text-red-500'>
                {formState.errors.name.join(', ')}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='season'>Season</Label>
            <Input
              id='season'
              name='season'
              type='number'
              placeholder={'2026'}
              defaultValue=''
              disabled={isPending}
            />
            {formState.errors?.code && (
              <p className='text-sm text-red-500'>
                {formState.errors.code.join(', ')}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='color'>Anzahl Rennen</Label>
            <Input
              id='plannedMeetings'
              name='plannedMeetings'
              type='number'
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
              onClick={(e) => {
                (e.preventDefault(), setIsAddOpen(false));
              }}
            >
              Abbrechen
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Speichern…' : 'Driver anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChampionshipForm;
