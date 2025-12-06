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
import { Label } from 'recharts';

function EditDriver({ driver }: { driver: Driver }) {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formState, action, isPending] = useActionState<FormState, FormData>(
    updateDriverAction,
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
        {editingDriver && (
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Name</Label>
              <Input
                value={editingDriver.name}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Driver Code</Label>
              <Input
                value={editingDriver.code}
                maxLength={3}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className='font-mono uppercase'
              />
            </div>
            <div className='space-y-2'>
              <Label>Team-Farbe</Label>
              <div className='flex gap-2'>
                <Input
                  type='color'
                  value={editingDriver.teamColor}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      teamColor: e.target.value,
                    })
                  }
                  className='h-10 w-16 p-1'
                />
                <Input
                  value={editingDriver.teamColor}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      teamColor: e.target.value,
                    })
                  }
                  className='font-mono'
                />
              </div>
            </div>
          </div>
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
      </DialogContent>
    </Dialog>
  );
}

export default EditDriver;
