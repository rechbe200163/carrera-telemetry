'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Drivers } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DriverBadge } from './driver-badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';

export function SelectDriverComponent({ drivers }: { drivers: Drivers[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedDriverId = searchParams.get('driverId') ?? '';

  function setDriverId(nextDriverId: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!nextDriverId) params.delete('driverId');
    else params.set('driverId', nextDriverId);

    // replace: kein History-Spam beim Durchklicken
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='text-lg flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Fahrer auswählen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedDriverId}
          onValueChange={(v) => setDriverId(String(v))}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select a fruit' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fahrer Dieser Session</SelectLabel>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  <DriverBadge driver={d} showName />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
