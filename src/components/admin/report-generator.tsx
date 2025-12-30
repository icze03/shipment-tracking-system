"use client";

import { useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { getShipmentsAction, getDriversAction } from "@/lib/actions";
import type { Shipment, Driver } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function ReportGenerator() {
  const [isShipmentsPending, startShipmentsTransition] = useTransition();
  const [isDriversPending, startDriversTransition] = useTransition();
  const { toast } = useToast();

  const convertToCSV = (data: any[], headers: string[]) => {
    const headerRow = headers.join(",");
    const rows = data.map((row) => {
      return headers
        .map((header) => {
          // Handle nested objects and arrays by JSON.stringify
          const value = getProperty(row, header);
          if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          // Escape quotes and handle commas
          const stringValue = String(value ?? "");
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(",");
    });
    return [headerRow, ...rows].join("\n");
  };

  const getProperty = (obj: any, path: string) => {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : null), obj);
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportShipments = () => {
    startShipmentsTransition(async () => {
      const shipments = await getShipmentsAction();
      if (!shipments || shipments.length === 0) {
        toast({ title: "No shipment data to export.", variant: "destructive" });
        return;
      }
      
      const headers = [
        'id', 'orderCode', 'assignedDriverId', 'assignedDriverName', 
        'createdAt', 'updatedAt', 'currentStatus', 'isCompleted', 
        'origin', 'destination', 'description', 'notes', 
        'statusTimestamps', 'statusLogs'
      ];
      
      const csvContent = convertToCSV(shipments, headers);
      downloadCSV(csvContent, `greenlane_shipments_${new Date().toISOString()}.csv`);
      toast({ title: "Shipment report generated successfully!" });
    });
  };

  const handleExportDrivers = () => {
    startDriversTransition(async () => {
      const drivers = await getDriversAction();
      if (!drivers || drivers.length === 0) {
        toast({ title: "No driver data to export.", variant: "destructive" });
        return;
      }

      // Exclude passwordHash for security
      const headers = ['id', 'name', 'email', 'phone', 'licenseNumber', 'status'];
      
      const csvContent = convertToCSV(drivers, headers);
      downloadCSV(csvContent, `greenlane_drivers_${new Date().toISOString()}.csv`);
      toast({ title: "Driver report generated successfully!" });
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Shipment Data</CardTitle>
          <CardDescription>
            Export a complete CSV file of all shipments, including their status history and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportShipments} disabled={isShipmentsPending}>
            {isShipmentsPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Export All Shipments
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Driver Data</CardTitle>
          <CardDescription>
            Export a complete CSV file of all registered drivers in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportDrivers} disabled={isDriversPending}>
            {isDriversPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Export All Drivers
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
