'use client';

import { useActionState, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Controllers, Drivers } from '@/lib/types';
import { createSessionEntriesAction } from '@/lib/actions/session-entries.actions';

type AddSessionEntryFormProps = {
  sessionId: string | number;
  drivers: Drivers[];
  controllers: Controllers[];
};

export function AddSessionEntryForm({
  sessionId,
  drivers,
  controllers,
}: AddSessionEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    createSessionEntriesAction.bind(null, Number(sessionId)),
    initialState
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Fahrer hinzufügen
        </Button>
      </DialogTrigger>

      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Fahrer &amp; Controller zuordnen</DialogTitle>
          <DialogDescription>
            Lege fest, welcher Fahrer mit welchem Controller in dieser Session
            fährt.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className='space-y-4 py-4'>
          {/* Driver */}
          <div className='space-y-2'>
            <Label htmlFor='driverId'>Fahrer</Label>
            <Select name='driverId'>
              <SelectTrigger>
                <SelectValue placeholder='Fahrer wählen…' />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={String(driver.id)}>
                    <div className='flex items-center gap-2'>
                      {driver.color && (
                        <span
                          className='h-3 w-3 rounded-full'
                          style={{ backgroundColor: driver.color }}
                        />
                      )}
                      <span className='font-mono'>{driver.code}</span>
                      <span className='text-muted-foreground'>
                        - {driver.first_name} {driver.last_name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formState.errors?.driverId && (
              <p className='text-sm text-red-500'>
                {formState.errors.driverId.join(', ')}
              </p>
            )}
          </div>

          {/* Controller */}
          <div className='space-y-2'>
            <Label htmlFor='controllerAddress'>Controller</Label>
            <Select name='controllerAddress'>
              <SelectTrigger>
                <SelectValue placeholder='Controller wählen…' />
              </SelectTrigger>
              <SelectContent>
                {controllers.map((controller) => (
                  <SelectItem
                    key={controller.id}
                    value={controller.address.toString()}
                  >
                    <div className='flex items-center gap-2'>
                      {controller.icon && <span>{controller.icon}</span>}
                      <span>Addresse {controller.address}</span>
                      {controller.name && (
                        <span className='text-muted-foreground text-xs'>
                          ({controller.name})
                        </span>
                      )}
                      {controller.notes && (
                        <span className='text-muted-foreground text-xs'>
                          - {controller.notes}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formState.errors?.controllerAddress && (
              <p className='text-sm text-red-500'>
                {formState.errors.controllerAddress.join(', ')}
              </p>
            )}
          </div>

          {/* Car Label */}
          <div className='space-y-2'>
            <Label htmlFor='carLabel'>Auto (optional)</Label>
            <Input
              id='carLabel'
              name='carLabel'
              placeholder='z.B. Blauer Porsche'
              disabled={isPending}
            />
            {formState.errors?.carLabel && (
              <p className='text-sm text-red-500'>
                {formState.errors.carLabel.join(', ')}
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
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Speichern…' : 'Zuordnung anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
