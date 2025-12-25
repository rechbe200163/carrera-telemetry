import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SessionType } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const controllerIcons = ['🔵', '🔴', '🟢', '🟡', '⚪', '🟠', '🟣', '🟤'];

export const controllerColors = [
  { key: 'blue', color: 'text-blue-500' },
  { key: 'red', color: 'text-red-500' },
  { key: 'green', color: 'text-green-500' },
  { key: 'yellow', color: 'text-yellow-500' },
  { key: 'orange', color: 'text-orange-500' },
  { key: 'purple', color: 'text-purple-500' },
  { key: 'brown', color: 'text-amber-800' },
  { key: 'gray', color: 'text-gray-400' },
] as const;

const SESSION_BADGE_CLASSES: Record<SessionType, string> = {
  PRACTICE: 'bg-practice text-white',
  QUALYFING: 'bg-quali text-black',
  RACE: 'bg-race text-white',
  FUN: 'bg-fun text-black',
};

export function getSessionBadgeClass(type: SessionType): string {
  return SESSION_BADGE_CLASSES[type];
}

export function safeMin(
  values: Array<number | null | undefined>
): number | null {
  const v = values.filter(
    (x): x is number => typeof x === 'number' && Number.isFinite(x)
  );
  return v.length ? Math.min(...v) : null;
}

export function formatDate(date: Date | null | undefined) {
  if (!date) {
    return 'TBD';
  }
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('de-AT');
}
