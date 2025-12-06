'use client';

import { useActionState, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

const AddDriverForm = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    createDriverAction,
    initialState
  );

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Driver
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Neuer Fahrer</DialogTitle>
          <DialogDescription>
            Erstelle einen neuen Fahrer für das System.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>Vorname</Label>
            <Input
              id='firstName'
              name='firstName'
              placeholder='Max Verstappen'
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
            <Label htmlFor='lastName'>Nachname</Label>
            <Input
              id='lastName'
              name='lastName'
              placeholder='Max Verstappen'
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
            <Label htmlFor='color'>Nachname</Label>
            <Input id='color' name='color' type='color' disabled={isPending} />
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

          <Button
            type='submit'
            className='mt-2 rounded bg-primary px-4 py-2 text-white disabled:opacity-50'
            disabled={isPending}
          >
            {isPending ? 'Speichern…' : 'Driver anlegen'}
          </Button>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddOpen(false)}>
              Abbrechen
            </Button>
            <Button type='submit'>Fahrer erstellen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverForm;
