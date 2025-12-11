import LiveTimingComonent from '@/components/live-timing';
import { SessionTypeBadge } from '@/components/session-type-badge';
import { Button } from '@/components/ui/button';
import { getSessionById } from '@/lib/api/session-api.service';
import { ArrowLeft, Circle, Clock, Flag } from 'lucide-react';
import Link from 'next/link';

export default async function LiveTimingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionById(Number(id));
  return <LiveTimingComonent session={session} />;
}
