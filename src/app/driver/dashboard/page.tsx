import { getDriverShipment } from "@/lib/data/shipments";
import { getDrivers } from "@/lib/data/drivers";
import { StatusUpdatePanel } from "@/components/driver/status-update-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck } from "lucide-react";
import { getMockUser } from "@/lib/auth";

export default async function DriverDashboardPage() {
  // In a real app, you'd get the logged-in driver's ID from auth state.
  // We are simulating this by getting the mock user from our auth system.
  const driver = await getMockUser("driver");
  
  if (!driver) {
    // This case should ideally not happen with the mock system
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

  const shipment = await getDriverShipment(driver.id);

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

  return <StatusUpdatePanel shipment={shipment} driverId={driver.id} />;
}
