import { Badge } from '@/components/ui/badge';
import { cn, getSessionBadgeClass } from '@/lib/utils';
import { SessionType } from '@/lib/types';

interface SessionTypeBadgeProps {
  type: SessionType;
  size?: 'sm' | 'default' | 'lg';
}

export function SessionTypeBadge({
  type,
  size = 'default',
}: SessionTypeBadgeProps) {
  const getTypeStyles = (type: SessionType) => {
    switch (type) {
      case SessionType.PRACTICE:
        return getSessionBadgeClass(SessionType.PRACTICE);
      case SessionType.QUALYFING:
        return getSessionBadgeClass(SessionType.QUALYFING);
      case SessionType.RACE:
        return getSessionBadgeClass(SessionType.RACE);
      case SessionType.FUN:
        return getSessionBadgeClass(SessionType.FUN);
    }
  };

  return (
    <Badge
      className={cn(
        'font-mono uppercase tracking-wider',
        getTypeStyles(type),
        size === 'sm' && 'text-xs px-1.5 py-0',
        size === 'lg' && 'text-base px-4 py-1'
      )}
    >
      {type}
    </Badge>
  );
}
