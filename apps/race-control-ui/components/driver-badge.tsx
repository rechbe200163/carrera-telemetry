import { cn } from '@/lib/utils';
import type { Driver } from '@/lib/types';

interface DriverBadgeProps {
  driver: Driver;
  showName?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function DriverBadge({
  driver,
  showName = false,
  size = 'default',
}: DriverBadgeProps) {
  return (
    <div className='flex items-center gap-2'>
      <div
        className={cn(
          'flex items-center justify-center rounded font-mono font-bold',
          size === 'sm' && 'h-6 w-10 text-xs',
          size === 'default' && 'h-7 w-12 text-sm',
          size === 'lg' && 'h-8 w-14 text-base'
        )}
        style={{
          backgroundColor: driver.color || '#666',
          color: '#fff',
        }}
      >
        {driver.code}
      </div>
      {showName && (
        <span
          className={cn(
            'font-medium',
            size === 'sm' && 'text-sm',
            size === 'default' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {driver.first_name} {driver.last_name}
        </span>
      )}
    </div>
  );
}
