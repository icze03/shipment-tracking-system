
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getDriverShipmentsAction } from "@/lib/actions";
import { StatusUpdatePanel } from "@/components/driver/status-update-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck, Loader2 } from "lucide-react";
import { DriverShipmentCard } from "@/components/driver/driver-shipment-card";
import type { Shipment } from "@/lib/types";

export function DriverDashboardClient() {
  const { user: driver, isLoading: isAuthLoading } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoadingShipments, setIsLoadingShipments] = useState(true);

  useEffect(() => {
    async function fetchShipments() {
      if (driver) {
        setIsLoadingShipments(true);
        const driverShipments = await getDriverShipmentsAction(driver.id);
        setShipments(driverShipments);
        setIsLoadingShipments(false);
      } else if (!isAuthLoading) {
        // If auth is not loading and there is no driver, we can stop loading shipments.
        setIsLoadingShipments(false);
      }
    }
    fetchShipments();
  }, [driver, isAuthLoading]);

  useEffect(() => {
    if (!driver) return;

    const interval = setInterval(async () => {
      const driverShipments = await getDriverShipmentsAction(driver.id);
      setShipments(driverShipments);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [driver]);

  if (isAuthLoading || (isLoadingShipments && driver)) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
        <Alert className="max-w-md">
          <Truck className="h-4 w-4" />
          <AlertTitle>Not Logged In</AlertTitle>
          <AlertDescription>
            Could not identify the logged-in driver. Please log in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeShipment = shipments[0];
  const queuedShipments = shipments.slice(1);

  if (!activeShipment) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
        <Alert className="max-w-md">
          <Truck className="h-4 w-4" />
          <AlertTitle>All Clear, {driver.name}!</AlertTitle>
          <AlertDescription>
            You have no active shipments assigned. Enjoy your break!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Current Task</h1>
        <p className="text-muted-foreground">This is your highest priority shipment.</p>
      </div>
      <StatusUpdatePanel shipment={activeShipment} driverId={driver.id} />

      {queuedShipments.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight font-headline">Shipment Queue</h2>
            <p className="text-muted-foreground">These are your next assigned shipments.</p>
          </div>
          <div className="space-y-4">
            {queuedShipments.map((shipment) => (
              <DriverShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
