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

  // If the shipment is cancelled, show a special message.
  if (shipment.currentStatus === 'cancelled') {
    return (
        <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
            <Alert variant="destructive" className="max-w-lg">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Shipment {shipment.orderCode} Cancelled</AlertTitle>
                <AlertDescription>
                    <div className="space-y-4">
                        <p>This shipment has been cancelled by an administrator.</p>
                        {shipment.cancellationReason && (
                            <div>
                                <h4 className="font-bold">Reason:</h4>
                                <p>{shipment.cancellationReason}</p>
                            </div>
                        )}
                        {shipment.driverInstructions && (
                            <div>
                                <h4 className="font-bold">Next Instructions:</h4>
                                <p>{shipment.driverInstructions}</p>
                            </div>
                        )}
                         <p className="pt-2">Please contact your administrator if you have any questions.</p>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  // If the shipment is active, show the status update panel.
  return <StatusUpdatePanel shipment={shipment} driverId={driver.id} />;
}
