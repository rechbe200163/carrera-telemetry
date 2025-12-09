import ChampionsshipGrid from '@/components/tables/ChampionsshipGrid';
import AddChampionShipForm from '@/components/forms/championship/AddChampionship';
import { getAllChampionships } from '@/lib/api/championship-api.service';

export default async function ChampionshipsPage() {
  const championships = await getAllChampionships();
  return (
    <div className='flex flex-col'>
      <div className='p-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Championships</h1>
            <p className='text-muted-foreground'>
              Verwalte alle Meisterschaften
            </p>
          </div>
          <AddChampionShipForm />
        </div>

        {/* Championships Grid */}
        <ChampionsshipGrid championships={championships} />
      </div>
    </div>
  );
}
