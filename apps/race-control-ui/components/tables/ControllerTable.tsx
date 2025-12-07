import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Gamepad2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Controller } from '@/lib/types';
import EditController from '../forms/controllers/EditController';
function ControllerTable({ controllers }: { controllers: Controller[] }) {
  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20'>
            <Gamepad2 className='h-5 w-5 text-primary' />
          </div>
          <div>
            <CardTitle>Alle Controller</CardTitle>
            <p className='text-sm text-muted-foreground'>
              {controllers.length} von 6 Controllern konfiguriert
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='text-muted-foreground w-16'>
                Marker
              </TableHead>
              <TableHead className='text-muted-foreground'>Name</TableHead>
              <TableHead className='text-muted-foreground'>
                Controller Address
              </TableHead>
              <TableHead className='text-muted-foreground'>Hinweise</TableHead>
              <TableHead className='text-muted-foreground text-right'>
                Aktionen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {controllers
              .sort((a, b) => a.address - b.address)
              .map((controller) => (
                <TableRow key={controller.id} className='border-border'>
                  <TableCell>
                    <span className='text-2xl'>{controller.icon}</span>
                  </TableCell>
                  <TableCell>
                    <span className='font-medium'>{controller.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className='inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 font-mono text-sm font-medium'>
                      Addr {controller.address}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm text-muted-foreground'>
                      {controller.notes || '-'}
                    </span>
                  </TableCell>
                  <TableCell className='text-right'>
                    <EditController
                      controller={controller}
                      availableAddresses={[]} // ggf. real verfügbare Adressen hier setzen
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ControllerTable;
