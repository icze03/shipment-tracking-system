
import { getDrivers } from "@/lib/data/drivers";
import { DriverDataTable } from "@/components/admin/driver-data-table";
import { columns } from "@/components/admin/driver-columns";
import { getShipments } from "@/lib/data/shipments";

export default async function DriversPage() {
  const drivers = await getDrivers();
  const shipments = await getShipments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Driver Management</h2>
          <p className="text-muted-foreground">
            View and manage all drivers, including their assigned deliveries.
          </p>
        </div>
      </div>
      <DriverDataTable columns={columns} data={drivers} shipments={shipments} />
    </div>
  );
}
