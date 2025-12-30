"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Driver } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ClientOnly } from "@/components/client-only";

export const columns: ColumnDef<Driver>[] = [
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
    cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("name")}</div>,
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
      return (
        <Badge 
            variant={status === "active" ? "default" : "secondary"} 
            className="capitalize"
        >
          {status.replace('-', ' ')}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const driver = row.original;

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
                <DropdownMenuItem disabled>
                  Edit Driver
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ClientOnly>
        </div>
      );
    },
  },
];
