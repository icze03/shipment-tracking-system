
import { getDrivers } from "@/lib/data/drivers";
import { DriverDataTable } from "@/components/admin/driver-data-table";
import { columns } from "@/components/admin/driver-columns";

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Driver Management</h2>
          <p className="text-muted-foreground">
            View and manage your team of drivers.
          </p>
        </div>
      </div>
      <DriverDataTable columns={columns} data={drivers} />
    </div>
  );
}
