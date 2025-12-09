import Adddriver from '@/components/forms/drivers/AddDriver';
import { getAllDrivers } from '@/lib/api/driver-api.service';
import DriverTable from '@/components/tables/DriverTable';

export default async function DriversPage() {
  const drivers = await getAllDrivers();
  return (
    <div className='p-6 space-y-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Drivers</h1>
          <p className='text-muted-foreground'>
            Globale Fahrerverwaltung für alle Sessions
          </p>
        </div>
        <Adddriver />
      </div>

      {/* Drivers Table */}
      <DriverTable drivers={drivers} />
    </div>
  );
}
