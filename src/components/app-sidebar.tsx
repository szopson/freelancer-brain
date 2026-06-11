"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  CircleDashed,
  FolderOpen,
  Inbox,
  CalendarCheck,
  Brain,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const items = [
  { title: "Daily Brief", url: "/app/brief", icon: Sun },
  { title: "Otwarte pętle", url: "/app/loops", icon: CircleDashed },
  { title: "Pamięć projektów", url: "/app/clients", icon: FolderOpen },
  { title: "Joris Inbox", url: "/app/inbox", icon: Inbox },
  { title: "Przegląd tygodnia", url: "/app/review", icon: CalendarCheck },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5">
          <Brain className="size-5 text-primary" />
          <span className="font-semibold tracking-tight gradient-text">
            FreelancerBrain
          </span>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            LIGHT
          </Badge>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pięć funkcji LIGHT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.url)}
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Demo — dane fikcyjne (Marek, solo-konsultant)
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
