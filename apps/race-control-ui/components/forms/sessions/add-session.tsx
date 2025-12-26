'use client';

import { useActionState, useState } from 'react';
import { FormState, initialState } from '@/lib/fom.types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { addSessionAction } from '@/lib/actions/sessions.actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function AddSession({ meetingId }: { meetingId: number }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    addSessionAction.bind(null, meetingId),
    initialState
  );

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Neue Session
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card border-border'>
        <DialogHeader>
          <DialogTitle>Neue Session</DialogTitle>
          <DialogDescription>
            Erstelle eine neue Session für das System.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              name='name'
              placeholder='Session fürs Testen'
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
            <Label htmlFor='sessionType'>Art der Session</Label>
            <Select name='sessionType'>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Art der Session Auswählen' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='FUN'>Test</SelectItem>
                  <SelectGroup>
                    <SelectLabel>Bald Verfügbar</SelectLabel>
                    <SelectItem value='PRACTICE' disabled>
                      Training
                    </SelectItem>
                    <SelectItem value='QUALYFING' disabled>
                      Qualy
                    </SelectItem>
                    <SelectItem value='RACE' disabled>
                      Rennen
                    </SelectItem>
                  </SelectGroup>
                </SelectGroup>
              </SelectContent>
            </Select>
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
              {isPending ? 'Speichern…' : 'Session speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
