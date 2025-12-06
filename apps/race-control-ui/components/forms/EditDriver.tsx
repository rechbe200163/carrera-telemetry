'use client';
import { updateDriverAction } from '@/lib/actions/driver.actions';
import { FormState, initialState } from '@/lib/fom.types';
import { useActionState, useState } from 'react';
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
import { Driver } from '@/lib/types';
import { Pencil } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

function EditDriver({ driver }: { driver: Driver }) {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    updateDriverAction.bind(null, driver.id),
    initialState
  );

  return (
    <Dialog
      open={editingDriver?.id === driver.id}
      onOpenChange={(open) => !open && setEditingDriver(null)}
    >
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setEditingDriver(driver)}
        >
          <Pencil className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Fahrer bearbeiten</DialogTitle>
        </DialogHeader>
        <form action={action} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>Vorname</Label>
            <Input
              id='firstName'
              name='firstName'
              defaultValue={driver.first_name}
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
              defaultValue={driver.last_name}
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
            <Input
              id='color'
              name='color'
              type='color'
              defaultValue={driver.color}
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
            <Button variant='outline' onClick={() => setEditingDriver(null)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                console.log('a');
              }}
            >
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditDriver;
