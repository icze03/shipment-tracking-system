
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDriverShipments } from "@/lib/data/shipments";
import { StatusUpdatePanel } from "@/components/driver/status-update-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck } from "lucide-react";
import { getMockUserAction } from "@/lib/actions";
import { DriverShipmentCard } from "@/components/driver/driver-shipment-card";
import type { UserProfile, Shipment } from "@/lib/types";

type DriverDashboardClientProps = {
    initialDriver: UserProfile | null;
    initialShipments: Shipment[];
}

export function DriverDashboardClient({ initialDriver, initialShipments }: DriverDashboardClientProps) {
  const router = useRouter();
  const [driver, setDriver] = useState<UserProfile | null>(initialDriver);
  const [allAssignedShipments, setAllAssignedShipments] = useState<Shipment[]>(initialShipments);
  const [isLoading, setIsLoading] = useState(!initialDriver);

  const fetchDriverAndShipments = useCallback(async () => {
    // We can still use server actions to refetch data on the client
    const driverUser = await getMockUserAction("driver");
    setDriver(driverUser);
    if (driverUser) {
      const shipments = await getDriverShipments(driverUser.id);
      setAllAssignedShipments(shipments);
    }
    if (isLoading) setIsLoading(false);
  }, [isLoading]);

  useEffect(() => {
    // If initial data is not there, fetch it.
    if (!initialDriver) {
        fetchDriverAndShipments();
    }
  }, [initialDriver, fetchDriverAndShipments]);


  useEffect(() => {
    const interval = setInterval(() => {
      // Use router.refresh() to re-run the Server Component and get fresh data
      router.refresh();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  // Update state when initialShipments prop changes from router.refresh()
  useEffect(() => {
    setAllAssignedShipments(initialShipments);
  }, [initialShipments]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!driver) {
    return (
        <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
            <Alert className="max-w-md">
            <Truck className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Could not identify the logged-in driver.
            </AlertDescription>
            </Alert>
        </div>
    );
  }

  const activeShipment = allAssignedShipments[0];
  const queuedShipments = allAssignedShipments.slice(1);

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
