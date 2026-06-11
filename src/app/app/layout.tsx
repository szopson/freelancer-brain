import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { ResetButton } from "@/components/reset-button";
import { Mail, Calendar } from "lucide-react";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1 font-normal">
              <Mail className="size-3" /> Gmail — wkrótce
            </Badge>
            <Badge variant="outline" className="gap-1 font-normal">
              <Calendar className="size-3" /> Kalendarz — wkrótce
            </Badge>
          </div>
          <div className="ml-auto">
            <ResetButton />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
