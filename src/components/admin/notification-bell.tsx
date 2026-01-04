
"use client";

import Link from "next/link";
import { Bell, UserPlus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Driver, Shipment } from "@/lib/types";

type NotificationBellProps = {
  pendingDrivers: Driver[];
  shipmentsWithFlags: Shipment[];
}

export function NotificationBell({ pendingDrivers, shipmentsWithFlags }: NotificationBellProps) {
  const pendingDriversCount = pendingDrivers.length;
  const pendingCorrectionsCount = shipmentsWithFlags.length;
  const totalPending = pendingDriversCount + pendingCorrectionsCount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalPending > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0"
            >
              {totalPending}
            </Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {totalPending === 0 ? (
          <div className="p-4 text-sm text-center text-muted-foreground">
            You're all caught up!
          </div>
        ) : (
          <>
            {pendingDriversCount > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/admin/approvals" className="flex items-center gap-3">
                  <div className="bg-secondary p-2 rounded-full">
                    <UserPlus className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Pending Driver Approvals</p>
                    <p className="text-xs text-muted-foreground">{pendingDriversCount} new registration(s) to review.</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
            {pendingCorrectionsCount > 0 && (
              <DropdownMenuItem asChild>
                 <Link href="/admin/approvals?tab=corrections" className="flex items-center gap-3">
                   <div className="bg-destructive/10 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                   </div>
                   <div className="flex-1">
                    <p className="font-medium">Shipment Correction Requests</p>
                    <p className="text-xs text-muted-foreground">{pendingCorrectionsCount} shipment(s) need attention.</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
