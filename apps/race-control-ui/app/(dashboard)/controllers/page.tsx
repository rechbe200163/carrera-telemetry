import { Card, CardContent } from '@/components/ui/card';

import AddControllerForm from '@/components/forms/controllers/AddController';
import ControllerTable from '@/components/tables/ControllerTable';
import { controllerApiService } from '@/lib/api/controller-api.service copy';

const controllerIcons = ['🔵', '🔴', '🟢', '🟡', '⚪', '🟠', '🟣', '🟤'];

export default async function ControllersPage() {
  const controllers = await controllerApiService.getAll();

  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Controllers</h1>
            <p className='text-muted-foreground'>
              Verwaltung der physischen Carrera-Regler
            </p>
          </div>
          <AddControllerForm availableAddresses={[0, 1, 2, 3, 4, 5]} />
        </div>

        {/* Info Banner */}
        <Card className='border-primary/30 bg-primary/5'>
          <CardContent className='py-4'>
            <p className='text-sm text-muted-foreground'>
              <strong className='text-foreground'>
                Carrera Digital 132/124:
              </strong>{' '}
              Unterstützt bis zu 6 Controller mit Adressen 0-5. Jede Adresse
              kann nur einmal vergeben werden.
            </p>
          </CardContent>
        </Card>

        <ControllerTable controllers={controllers} />
      </div>
    </div>
  );
}
