'use client';

import {
  IconCirclePlusFilled,
  IconMail,
  IconFlag,
  IconTrophy,
  IconCalendar,
  IconClockHour4,
  IconChartBar,
  IconUsers,
  IconDeviceGamepad2,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain() {
  // Feste Navigationseinträge (keine props mehr)
  const mainNav = [
    { title: 'Dashboard', url: '/', icon: IconFlag },
    { title: 'Championships', url: '/championships', icon: IconTrophy },
    { title: 'Meetings', url: '/meetings', icon: IconCalendar },
    { title: 'Sessions', url: '/sessions', icon: IconClockHour4 },
    { title: 'Standings', url: '/standings', icon: IconChartBar },
  ];

  const masterData = [
    { title: 'Drivers', url: '/drivers', icon: IconUsers },
    { title: 'Controllers', url: '/controllers', icon: IconDeviceGamepad2 },
  ];

  function isActive() {}

  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-4'>
        {/* Main Navigation */}
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Master Data */}
        <SidebarMenu>
          {masterData.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
