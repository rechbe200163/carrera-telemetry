import { Sessions, SessionType, Status } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Clock,
  Eye,
  TestTubeDiagonal,
  Waypoints,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/status-badge';
import { SessionTypeBadge } from '@/components/session-type-badge';

const SessionCardComponent = ({ session }: { session: Sessions }) => {
  const getSessionIcon = (type: SessionType) => {
    switch (type) {
      case SessionType.PRACTICE:
        return <Clock className='h-5 w-5' />;
      case SessionType.QUALYFING:
        return <Clock className='h-5 w-5' />;
      case SessionType.RACE:
        return <Waypoints className='h-5 w-5' />;
      case SessionType.FUN:
        return <TestTubeDiagonal className='h-5 w-5' />;
      default:
        return <Clock className='h-5 w-5' />;
    }
  };
  return (
    <Card
      key={session.id}
      className={`bg-card border-border hover:border-primary/50 transition-colors ${
        session.status === Status.LIVE ? 'ring-2 ring-status-live/50' : ''
      }`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <SessionTypeBadge type={session.session_type} />
            {getSessionIcon(session.session_type)}
          </div>
          <StatusBadge status={session.status} size='sm' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          {session.session_type === 'RACE' ? (
            <div className='rounded-lg bg-secondary/50 p-3'>
              <p className='text-xs text-muted-foreground'>Runden</p>
              <p className='text-xl font-bold font-mono'>
                {session.lap_limit || '-'}
              </p>
            </div>
          ) : (
            <div className='rounded-lg bg-secondary/50 p-3'>
              <p className='text-xs text-muted-foreground'>Dauer</p>
              <p className='text-xl font-bold font-mono'>
                {(session.time_limit_seconds &&
                  session.time_limit_seconds / 60) ||
                  '-'}
              </p>
            </div>
          )}
          <div className='rounded-lg bg-secondary/50 p-3'>
            <p className='text-xs text-muted-foreground'>Status</p>
            <p className='text-sm font-medium mt-1'>{session.status}</p>
          </div>
        </div>

        <div className='flex gap-2'>
          {session.status === Status.FINISHED && (
            <Button
              variant='outline'
              size='sm'
              className='flex-1 bg-transparent'
              asChild
            >
              <Link href={`/sessions/${session.id}/results`}>
                <Eye className='mr-1 h-3 w-3' />
                Ergebnisse
              </Link>
            </Button>
          )}
          <Button
            variant={session.status === Status.LIVE ? 'default' : 'secondary'}
            size='sm'
            className='flex-1'
            asChild
          >
            <Link href={`/sessions/${session.id}`}>
              Session öffnen
              <ArrowRight className='ml-1 h-3 w-3' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCardComponent;
