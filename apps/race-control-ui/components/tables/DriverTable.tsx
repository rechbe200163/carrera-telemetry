import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { DriverBadge } from '@/components/driver-badge';

import { Plus, Pencil, Trash2, Users, BarChart3 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Drivers } from '@/lib/types';
import EditDriver from '../forms/drivers/EditDriver';
import DeleteDriver from '../forms/drivers/DeleteDriver';
import Link from 'next/link';

function DriverTable({ drivers }: { drivers: Drivers[] }) {
  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20'>
            <Users className='h-5 w-5 text-primary' />
          </div>
          <div>
            <CardTitle>Alle Fahrer</CardTitle>
            <p className='text-sm text-muted-foreground'>
              {drivers && drivers.length > 0
                ? `${drivers.length} Fahrer registriert`
                : 'Keine Fahrer registriert'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='text-muted-foreground'>Fahrer</TableHead>
              <TableHead className='text-muted-foreground'>
                Driver-Code
              </TableHead>
              <TableHead className='text-muted-foreground'>Farbe</TableHead>
              <TableHead className='text-muted-foreground text-right'>
                Aktionen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers?.map((driver) => (
              <TableRow key={driver.id} className='border-border'>
                <TableCell>
                  <DriverBadge driver={driver} size='default' />
                </TableCell>
                <TableCell>
                  <span className='font-mono text-sm font-medium'>
                    {driver.code}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-4 w-4 rounded-full border border-border'
                      style={{ backgroundColor: driver.color }}
                    />
                    <span className='font-mono text-xs text-muted-foreground'>
                      {driver.color}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      asChild
                      className='bg-transparent'
                    >
                      <Link href={`/drivers/${driver.id}/stats`}>
                        <BarChart3 className='mr-1.5 h-3.5 w-3.5' />
                        Daten
                      </Link>
                    </Button>
                    <EditDriver driver={driver} />
                    <DeleteDriver driverId={driver.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default DriverTable;
