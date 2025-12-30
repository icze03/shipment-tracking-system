import { getDriverShipment, getDrivers } from "@/lib/actions";
import { StatusUpdatePanel } from "@/components/driver/status-update-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck } from "lucide-react";

export default async function DriverDashboardPage() {
  // In a real app, you'd get the logged-in driver's ID from auth state.
  // We are simulating this by just grabbing the first available driver for the demo.
  // The useAuth hook will handle the actual user context on the client.
  const drivers = await getDrivers();
  const driver = drivers[0];
  if (!driver) {
    return (
        <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
            <Alert className="max-w-md">
            <Truck className="h-4 w-4" />
            <AlertTitle>No Drivers Available</AlertTitle>
            <AlertDescription>
                There are no drivers in the system to assign a shipment to.
            </AlertDescription>
            </Alert>
        </div>
    );
  }

  const shipment = await getDriverShipment(driver.uid);

  if (!shipment) {
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

  return <StatusUpdatePanel shipment={shipment} driverId={driver.uid} />;
}
