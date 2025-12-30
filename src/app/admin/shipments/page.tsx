import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShipments } from "@/lib/data/shipments";
import { ShipmentDataTable } from "@/components/admin/shipment-data-table";
import { columns } from "@/components/admin/shipment-columns";
import Link from "next/link";

export default async function AdminShipmentsPage() {
  const shipments = await getShipments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Shipment Overview</h2>
          <p className="text-muted-foreground">
            Monitor and manage all ongoing and completed shipments.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button asChild>
            <Link href="/admin/shipments/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Shipment
            </Link>
          </Button>
        </div>
      </div>
      <ShipmentDataTable columns={columns} data={shipments} />
    </div>
  );
}
