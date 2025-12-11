import { cn } from '@/lib/utils';

interface LapTimeDisplayProps {
  timeMs: number;
  highlight?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function LapTimeDisplay({
  timeMs,
  highlight = false,
  size = 'default',
}: LapTimeDisplayProps) {
  const formatLapTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor(ms % 1000);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        highlight && 'text-quali font-bold',
        size === 'sm' && 'text-sm',
        size === 'default' && 'text-base',
        size === 'lg' && 'text-lg'
      )}
    >
      {formatLapTime(timeMs)}
    </span>
  );
}
