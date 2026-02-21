
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, ArrowUpDown, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Shipment } from "@/lib/types";
import { StatusProgress } from "@/components/shipment/status-progress";
import { Badge } from "@/components/ui/badge";
import { STATUS_DETAILS } from "@/lib/constants";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { ClientOnly } from "@/components/client-only";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { cancelShipmentAction, deleteShipmentAction } from "@/lib/actions";

function ActionsCell({ shipment }: { shipment: Shipment }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCancel = () => {
    if (!confirm(`Are you sure you want to cancel shipment ${shipment.orderCode}? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await cancelShipmentAction(shipment.id, "Cancelled by admin from dashboard.");
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Shipment has been cancelled." });
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to permanently delete shipment ${shipment.orderCode}? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteShipmentAction(shipment.id);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Shipment has been deleted." });
      }
    });
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
            <DropdownMenuItem asChild>
              <Link href={`/admin/shipments/${shipment.id}`}>
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/track?orderCode=${shipment.orderCode}`}>
                View Public Page
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCancel}
              disabled={isPending || shipment.isCompleted || shipment.currentStatus === 'cancelled'}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Shipment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isPending || !shipment.isCompleted}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Shipment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ClientOnly>
    </div>
  );
}

export const columns: ColumnDef<Shipment>[] = [
  {
    accessorKey: "orderCode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const hasFlaggedLog = row.original.statusLogs.some(log => log.isFlagged);
      return (
        <div className="flex items-center gap-2 font-medium pl-4">
          {hasFlaggedLog && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Correction pending</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {row.getValue("orderCode")}
        </div>
      );
    },
  },
  {
    accessorKey: "assignedDriverName",
    header: "Driver",
  },
    {
    accessorKey: "destinations",
    header: "Final Destination",
    cell: ({ row }) => {
        const shipment = row.original;
        const finalDestination = shipment.destinations[shipment.destinations.length - 1];
        return <span>{finalDestination}</span>
    }
  },
  {
    accessorKey: "currentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("currentStatus") as Shipment["currentStatus"];
      const statusDetail = STATUS_DETAILS[status];
      const isCompleted = row.original.isCompleted;

      return (
        <Badge variant={isCompleted ? "default" : "secondary"} className="capitalize">
          {statusDetail?.label || status}
        </Badge>
      );
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const shipment = row.original;
      return <StatusProgress shipment={shipment} />;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Update
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as string;
      return <div className="text-right pr-4"><ClientFormattedDate date={date} /></div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell shipment={row.original} />,
  },
];
