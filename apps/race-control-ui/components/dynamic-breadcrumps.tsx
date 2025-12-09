'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

const segmentLabelMap: Record<string, string> = {
  // Main nav
  '': 'Dashboard',
  dashboard: 'Dashboard',
  championships: 'Championships',
  meetings: 'Meetings',
  sessions: 'Sessions',
  standings: 'Standings',

  // Master data
  drivers: 'Drivers',
  controllers: 'Controllers',
};

function capitalize(word: string) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function DynamicBreadcrumbs() {
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);

  const items: { label: string; href?: string }[] = [];

  // Root / Dashboard
  items.push({ label: 'Dashboard', href: '/' });

  if (segments.length > 0) {
    const [resource, second, third] = segments;
    const resourceLabel =
      segmentLabelMap[resource] ?? capitalize(resource.replace('-', ' '));

    if (resourceLabel) {
      items.push({
        label: resourceLabel,
        href: `/${resource}`,
      });
    }

    const lastSegment = segments[segments.length - 1];

    // Actions / Detail
    if (['add', 'new', 'create'].includes(lastSegment)) {
      items.push({ label: 'Add' });
    } else if (lastSegment === 'edit') {
      items.push({ label: 'Edit' });
    } else if (/^\d+$/.test(lastSegment)) {
      // z.B. /drivers/12 -> #12
      items.push({ label: `#${lastSegment}` });
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage className='text-base font-medium'>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
