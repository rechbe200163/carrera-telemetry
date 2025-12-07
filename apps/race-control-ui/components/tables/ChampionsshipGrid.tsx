import { Championships } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowRight, Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

function ChampionsshipGrid({
  championships,
}: {
  championships: Championships[];
}) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {championships.map((championship) => (
        <Card
          key={championship.id}
          className='bg-card border-border group hover:border-primary/50 transition-colors'
        >
          <CardHeader className='flex flex-row items-start justify-between pb-3'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20'>
                <Trophy className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle className='text-base'>{championship.name}</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Season {championship.season}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Meetings</span>
              <span className='font-mono font-medium'>
                {championship.held_meetings} / {championship.planned_meetings}
              </span>
            </div>

            {/* Progress bar */}
            <div className='h-2 w-full rounded-full bg-secondary'>
              <div
                className='h-2 rounded-full bg-primary transition-all'
                style={{
                  width: `${(championship.held_meetings / championship.planned_meetings) * 100}%`,
                }}
              />
            </div>

            <Button variant='secondary' className='w-full' asChild>
              <Link href={`/championships/${championship.id}`}>
                Details anzeigen
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ChampionsshipGrid;
