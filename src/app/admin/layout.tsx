
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/layout/user-nav";
import { LayoutDashboard, Truck, Users, FileDown, UserCheck } from "lucide-react";
import { getShipments } from "@/lib/data/shipments";
import { getDrivers } from "@/lib/data/drivers";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/admin/notification-bell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shipments = await getShipments();
  const drivers = await getDrivers();

  const pendingDrivers = drivers.filter(d => d.status === 'pending');
  const shipmentsWithFlags = shipments.filter(s => s.statusLogs.some(log => log.isFlagged));
  
  const totalPending = pendingDrivers.length + shipmentsWithFlags.length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/admin/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Shipments">
                  <Link href="/admin/shipments">
                    <Truck />
                    <span>Shipments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Approvals">
                  <Link href="/admin/approvals">
                    <UserCheck />
                    <span>Approvals</span>
                     {totalPending > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {totalPending}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Drivers">
                  <Link href="/admin/drivers">
                    <Users />
                    <span>Drivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Reports">
                  <Link href="/admin/reports">
                    <FileDown />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                    <div className="flex gap-2 items-center">
                        <SidebarTrigger className="md:hidden"/>
                        <h1 className="text-lg font-bold tracking-tight hidden md:block">Admin Dashboard</h1>
                    </div>
                    
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            <NotificationBell 
                              pendingDrivers={pendingDrivers}
                              shipmentsWithFlags={shipmentsWithFlags}
                            />
                            <UserNav />
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-8 pt-6">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
