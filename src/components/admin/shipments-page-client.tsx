
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shipment } from "@/lib/types";
import { ShipmentDataTable } from "@/components/admin/shipment-data-table";
import { columns } from "@/components/admin/shipment-columns";
import { ClearShipmentsDialog } from "@/components/admin/clear-shipments-dialog";

export function ShipmentsPageClient({ shipments }: { shipments: Shipment[] }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Shipment Overview</h2>
          <p className="text-muted-foreground">
            Monitor and manage all ongoing and completed shipments.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <ClearShipmentsDialog onClear={() => router.refresh()} />
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
