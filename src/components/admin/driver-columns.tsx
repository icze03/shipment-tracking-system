"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Driver, Shipment } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ClientOnly } from "@/components/client-only";
import { useTransition } from "react";
import { removeDriverAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ActionsCell({ driver }: { driver: Driver }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove driver ${driver.name}? This action cannot be undone.`)) {
      startTransition(async () => {
        const result = await removeDriverAction(driver.id);
        if (result.error) {
          toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
          toast({ title: "Success", description: "Driver has been removed." });
        }
      });
    }
  };

  return (
    <div className="text-right pr-4">
      <ClientOnly>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(driver.email)}
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/drivers/edit/${driver.id}`}>
                Edit Driver
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleRemove}
              disabled={isPending}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              Remove Driver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ClientOnly>
    </div>
  );
}

export const columns: ColumnDef<Driver>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row, table }) => {
        const driverId = row.original.id;
        const allShipments = (table.options.meta as { shipments: Shipment[] })?.shipments || [];
        const driverHasShipments = allShipments.some(s => s.assignedDriverId === driverId);

        if (!driverHasShipments) return <div className="w-8 h-8"></div>;

        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => row.toggleExpanded()}
                className="h-8 w-8"
            >
                <ChevronRight className={cn("h-4 w-4 transition-transform", row.getIsExpanded() && "rotate-90")} />
                <span className="sr-only">Toggle shipments</span>
            </Button>
        );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
    {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "licenseNumber",
    header: "License Number",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Driver["status"];
      const variantMap: { [key in Driver['status']]: "default" | "secondary" | "outline" | "destructive" } = {
        active: "default",
        inactive: "secondary",
        "on-leave": "outline",
        pending: "destructive",
      };
      return (
        <Badge 
            variant={variantMap[status] || 'secondary'} 
            className="capitalize"
        >
          {status.replace('-', ' ')}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell driver={row.original} />,
  },
];
