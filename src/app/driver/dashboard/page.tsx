import { getDriverShipments } from "@/lib/data/shipments";
import { StatusUpdatePanel } from "@/components/driver/status-update-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck } from "lucide-react";
import { getMockUser } from "@/lib/auth";
import { DriverShipmentCard } from "@/components/driver/driver-shipment-card";

export default async function DriverDashboardPage() {
  const driver = await getMockUser("driver");
  
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

  const allAssignedShipments = await getDriverShipments(driver.id);
  const activeShipment = allAssignedShipments[0];
  const queuedShipments = allAssignedShipments.slice(1);

  if (!activeShipment) {
    // Check for a recently cancelled shipment to show the acknowledgement message
    const lastShipment = await getDriverShipments(driver.id);
    if (lastShipment.length > 0 && lastShipment[0].currentStatus === 'cancelled' && !lastShipment[0].cancellationAcknowledged) {
        return <StatusUpdatePanel shipment={lastShipment[0]} driverId={driver.id} />;
    }

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

  // If there is an active shipment, show the main update panel for it.
  // And list the queued shipments below.
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
