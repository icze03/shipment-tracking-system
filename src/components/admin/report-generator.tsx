
"use client";

import { useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { getShipmentsAction, getDriversAction } from "@/lib/actions";
import type { Shipment, Driver, StatusLog, Expense } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

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
      
      const expenseTypes = [...new Set(shipments.flatMap(s => s.expenses?.map(e => e.type) || []))];
      const expenseHeaders = expenseTypes.map(type => `expense_${type.toLowerCase().replace(/\s+/g, '_')}`);

      const headers = [
        'id', 'orderCode', 'assignedDriverId', 'assignedDriverName', 
        'createdAt', 'updatedAt', 'currentStatus', 'isCompleted', 
        'origin', 'destinations', 'description', 'notes', 
        'cancellationReason', 'driverInstructions', 'cancellationAcknowledged',
        'statusLogs', // Replaced individual status columns with the full log
        ...expenseHeaders,
        'total_expenses'
      ];
      
      const formattedShipments = shipments.map(s => {
        // Format dates within the status logs for better readability
        const formattedLogs = s.statusLogs.map(log => ({
            ...log,
            timestamp: formatDate(log.timestamp)
        }));

        const flatExpenses = expenseTypes.reduce((acc, type) => {
            const expenseKey = `expense_${type.toLowerCase().replace(/\s+/g, '_')}`;
            const totalAmount = s.expenses?.filter(e => e.type === type).reduce((sum, e) => sum + e.amount, 0) || 0;
            acc[expenseKey] = totalAmount;
            return acc;
        }, {} as Record<string, number>);

        const totalExpenses = s.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

        return {
            ...s,
            createdAt: formatDate(s.createdAt),
            updatedAt: formatDate(s.updatedAt),
            statusLogs: formattedLogs, // Pass the entire formatted log array
            ...flatExpenses,
            total_expenses: totalExpenses
        }
      });

      const csvContent = convertToCSV(formattedShipments, headers);
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
            Export a complete CSV file of all shipments, including their status history, expenses, and details.
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
