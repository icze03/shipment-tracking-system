import { CreateShipmentForm } from "@/components/admin/create-shipment-form";
import { getDrivers } from "@/lib/data/drivers";

export default async function CreateShipmentPage() {
  const drivers = await getDrivers();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Create New Shipment</h2>
        <p className="text-muted-foreground">
          Fill in the details below to create and assign a new shipment.
        </p>
      </div>
      <CreateShipmentForm drivers={drivers} />
    </div>
  );
}
