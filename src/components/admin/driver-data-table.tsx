"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Driver, Shipment } from "@/lib/types";
import { StatusProgress } from "@/components/shipment/status-progress";
import { Badge } from "@/components/ui/badge";
import { STATUS_DETAILS } from "@/lib/constants";
import { ClientFormattedDate } from "@/components/client-formatted-date";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  shipments: Shipment[];
}

function DriverShipmentsSubComponent({ shipments }: { shipments: Shipment[] }) {
    if (shipments.length === 0) {
        return <div className="px-4 py-8 text-center text-sm text-muted-foreground">No active or recent shipments for this driver.</div>
    }

    return (
        <div className="p-4 bg-muted/50">
            <h4 className="text-sm font-semibold mb-2 pl-2">Assigned Shipments ({shipments.length})</h4>
            <div className="rounded-md border bg-card">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order Code</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead className="text-right">Last Update</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shipments.slice(0, 5).map(shipment => (
                            <TableRow key={shipment.id} className="hover:bg-transparent">
                                <TableCell className="font-medium">
                                    <Button variant="link" asChild className="p-0 h-auto">
                                        <Link href={`/admin/shipments/${shipment.id}`}>
                                            {shipment.orderCode}
                                        </Link>
                                    </Button>
                                </TableCell>
                                <TableCell>{shipment.destinations[shipment.destinations.length - 1]}</TableCell>
                                <TableCell>
                                     <Badge variant={shipment.isCompleted ? "default" : "secondary"} className="capitalize">
                                        {STATUS_DETAILS[shipment.currentStatus]?.label || shipment.currentStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <StatusProgress shipment={shipment} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <ClientFormattedDate date={shipment.updatedAt} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {shipments.length > 5 && <p className="text-xs text-muted-foreground text-center mt-2">...and {shipments.length - 5} more.</p>}
        </div>
    )
}


export function DriverDataTable<TData extends Driver, TValue>({
  columns,
  data,
  shipments,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      expanded,
    },
    meta: {
        shipments
    }
  });

  return (
    <div className="rounded-md border bg-card">
      <div className="p-4">
        <Input
          placeholder="Filter by name..."
          value={
            (table.getColumn("name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
                const driverShipments = shipments.filter(s => s.assignedDriverId === row.original.id);
                return (
                <React.Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={row.getVisibleCells().length}>
                               <DriverShipmentsSubComponent shipments={driverShipments} />
                            </TableCell>
                        </TableRow>
                    )}
                </React.Fragment>
            )})
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No drivers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
