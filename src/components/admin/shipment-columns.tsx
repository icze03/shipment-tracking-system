"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Shipment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusProgress } from "@/components/shipment/status-progress";
import { Badge } from "@/components/ui/badge";
import { STATUS_DETAILS } from "@/lib/constants";

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
    cell: ({ row }) => <div className="font-medium">{row.getValue("orderCode")}</div>,
  },
  {
    accessorKey: "assignedDriverName",
    header: "Driver",
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
      return <div className="text-right">{formatDate(row.getValue("updatedAt"))}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const shipment = row.original;

      return (
        <div className="text-right">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
