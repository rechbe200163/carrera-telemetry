import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SessionType } from '@/lib/types';

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
      case 'PRACTICE':
        return 'bg-practice text-white';
      case 'QUALYFING':
        return 'bg-quali text-black';
      case 'RACE':
        return 'bg-race text-white';
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
