'use client';
import { Controllers } from '@/lib/types';
import { useActionState, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Pencil } from 'lucide-react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { FormState, initialState } from '@/lib/fom.types';
import { NativeSelect, NativeSelectOption } from '../../ui/native-select';
import { Radio, RadioGroup } from '../../ui/radio-group';
import { updateControllerAction } from '@/lib/actions/controller.actions';

const EditController = ({
  controller,
  availableAddresses,
}: {
  controller: Controllers;
  availableAddresses: number[];
}) => {
  const [editingController, setEditingController] =
    useState<Controllers | null>(null);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    updateControllerAction.bind(null, controller.id),
    initialState
  );

  const controllerIcons = ['🔵', '🔴', '🟢', '🟡', '⚪', '🟠', '🟣', '🟤'];
  console.log(availableAddresses);
  return (
    <Dialog
      open={editingController?.id === controller.id}
      onOpenChange={(open) => !open && setEditingController(null)}
    >
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setEditingController(controller)}
        >
          <Pencil className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Controller bearbeiten</DialogTitle>
        </DialogHeader>
        <form action={action} className='space-y-4 py-4'>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input id='name' defaultValue={controller.name} name='name' />
              {formState.errors?.name && (
                <p className='text-sm text-red-500'>
                  {formState.errors.name.join(', ')}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label> Kontroller Addresse (1-6)</Label>
              <NativeSelect
                name='controllerAddress'
                defaultValue={controller.address}
              >
                <NativeSelectOption>
                  Kontroller Addresse (1-6)
                </NativeSelectOption>
                {availableAddresses.map((addr) => (
                  <NativeSelectOption key={addr} value={String(addr)}>
                    Addresse {addr}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {formState.errors?.name && (
                <p className='text-sm text-red-500'>
                  {formState.errors.name.join(', ')}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Visueller Marker</Label>
              <RadioGroup
                name='icon'
                className='grid grid-cols-4 gap-2'
                defaultValue={controller.icon}
              >
                {controllerIcons.map((icon) => (
                  <Label
                    key={icon}
                    className='flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-muted data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary'
                  >
                    <Radio value={icon} className='hidden' />
                    <span className='text-xl'>{icon}</span>
                  </Label>
                ))}
              </RadioGroup>
              {formState.errors?.name && (
                <p className='text-sm text-red-500'>
                  {formState.errors.name.join(', ')}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes'>Hinweise (Optional)</Label>
              <Input
                id='notes'
                placeholder='z.B. Blaues Käppchen'
                defaultValue={controller.notes}
                name='notes'
              />
            </div>
            {formState.errors?.name && (
              <p className='text-sm text-red-500'>
                {formState.errors.name.join(', ')}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={(e) => {
                e.preventDefault();
                setEditingController(null);
              }}
            >
              Abbrechen
            </Button>
            <Button type='submit'>
              {isPending ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditController;
