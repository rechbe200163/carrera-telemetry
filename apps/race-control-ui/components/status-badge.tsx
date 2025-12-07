import { Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  SessionStatus,
  MeetingStatus,
  ChampionshipStatus,
} from '@/lib/types';

type StatusType = SessionStatus | MeetingStatus | ChampionshipStatus;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'default';
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'LIVE':
        return 'bg-status-live/20 text-status-live border-status-live/50';
      case 'FINISHED':
      case 'DONE':
      case 'COMPLETED':
        return 'bg-status-finished/20 text-muted-foreground border-status-finished/50';
      case 'ACTIVE':
        return 'bg-status-live/20 text-status-live border-status-live/50';
      default:
        return 'bg-status-planned/20 text-muted-foreground border-status-planned/50';
    }
  };

  const isLive = status === 'LIVE' || status === 'ACTIVE';

  return (
    <Badge
      variant='outline'
      className={cn(
        'font-mono uppercase tracking-wider',
        getStatusStyles(status),
        size === 'sm' && 'text-xs px-1.5 py-0'
      )}
    >
      {isLive && (
        <Circle className='mr-1.5 h-1.5 w-1.5 animate-pulse fill-current' />
      )}
      {status}
    </Badge>
  );
}
