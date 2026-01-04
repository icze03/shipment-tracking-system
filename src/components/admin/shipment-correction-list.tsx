
"use client";

import type { Shipment } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ChevronsRight } from "lucide-react";
import { ClientFormattedDate } from "../client-formatted-date";
import Link from "next/link";

type ShipmentCorrectionListProps = {
  shipments: Shipment[];
};

export function ShipmentCorrectionList({ shipments }: ShipmentCorrectionListProps) {
  
  if (shipments.length === 0) {
    return (
        <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 mt-4">
            <h3 className="text-lg font-semibold">No Correction Requests</h3>
            <p className="text-sm">There are no pending shipment corrections to review.</p>
        </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Code</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Flagged Status</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment) => {
              const flaggedLog = shipment.statusLogs.find(log => log.isFlagged);
              return (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        {shipment.orderCode}
                    </div>
                  </TableCell>
                  <TableCell>{shipment.assignedDriverName}</TableCell>
                  <TableCell className="capitalize">{flaggedLog?.status.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                      <ClientFormattedDate date={shipment.updatedAt} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/shipments/${shipment.id}`}>
                            Review & Resolve
                            <ChevronsRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
