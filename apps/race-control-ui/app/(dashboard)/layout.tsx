import React from 'react';
import { AppSidebar } from '../../components/app-sidebar';

import { SiteHeader } from '../../components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant='floating' collapsible='icon' />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
