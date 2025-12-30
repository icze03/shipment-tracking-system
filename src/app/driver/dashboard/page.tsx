import { getDriverShipment } from "@/lib/actions";
import { StatusUpdatePanel } from "@/components/driver/status-update-panel";
import { users } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck } from "lucide-react";

export default async function DriverDashboardPage() {
  // In a real app, you'd get the logged-in driver's ID from auth state.
  // We'll use our mock driver for this demo.
  const driver = users.find(u => u.role === 'driver');
  if (!driver) {
    return <p>No driver found. Please log in as a driver.</p>;
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
