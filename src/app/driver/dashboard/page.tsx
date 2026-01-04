import { getDriverShipment } from "@/lib/data/shipments";
import { StatusUpdatePanel } from "@/components/driver/status-update-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck, XCircle } from "lucide-react";
import { getMockUser } from "@/lib/auth";

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

  // Fetch all shipments assigned to the driver, including completed/cancelled ones.
  const shipment = await getDriverShipment(driver.id, true);

  if (!shipment || (shipment.isCompleted && shipment.currentStatus !== 'cancelled')) {
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

  // If the shipment is cancelled, or active, show the update panel.
  // The panel will decide what UI to show based on the shipment's state.
  return <StatusUpdatePanel shipment={shipment} driverId={driver.id} />;
}
