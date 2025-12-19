import React from 'react';
import { AppSidebar } from '../../components/app-sidebar';

import { SiteHeader } from '../../components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import SnowTheme from '@/components/snow-theme';

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const now = new Date();
  // const year = now.getFullYear();

  // const dezSt = new Date(year, 11, 1); // 1. Dezember
  // const janSix = new Date(year + 1, 0, 6); // 6. Jänner nächstes Jahr

  // const isSnowEnabled = now >= dezSt || now <= janSix;
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant='floating' collapsible='offcanvas' />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
      {/* {isSnowEnabled && <SnowTheme />} */}
    </SidebarProvider>
  );
}
