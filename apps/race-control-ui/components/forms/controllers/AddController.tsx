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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { createControllerAction } from '@/lib/actions/controller.actions';
import { NativeSelect, NativeSelectOption } from '../../ui/native-select';
import { Radio, RadioGroup, RadioGroupItem } from '../../ui/radio-group';

const AddControllerForm = ({
  availableAddresses,
}: {
  availableAddresses: number[];
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    createControllerAction,
    initialState
  );

  const controllerIcons = ['🔵', '🔴', '🟢', '🟡', '⚪', '🟠', '🟣', '🟤'];

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <Button disabled={availableAddresses.length === 0}>
          <Plus className='mr-2 h-4 w-4' />
          Kontroller hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Neuer Controller</DialogTitle>
          <DialogDescription>
            Registriere einen neuen physischen Carrera-Regler.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                placeholder='Controller 1'
                name='name'
                required
              />
              {formState.errors?.name && (
                <p className='text-sm text-red-500'>
                  {formState.errors.name.join(', ')}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label> Kontroller Addresse (0-5)</Label>
              <NativeSelect name='controllerAddress'>
                <NativeSelectOption>
                  Kontroller Addresse (0-5)
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
                defaultValue='🔵'
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
                setIsAddOpen(false);
              }}
            >
              Abbrechen
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Controller erstellen...' : 'Controller erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddControllerForm;
