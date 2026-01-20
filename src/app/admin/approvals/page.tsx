import { getDrivers } from "@/lib/data/drivers";
import { getShipments } from "@/lib/data/shipments";
import { ApprovalsPageClient } from "@/components/admin/approvals-page-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ApprovalsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-52" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default async function ApprovalsPage() {
  const drivers = await getDrivers();
  const shipments = await getShipments();

  return (
    <Suspense fallback={<ApprovalsPageSkeleton />}>
      <ApprovalsPageClient drivers={drivers} shipments={shipments} />
    </Suspense>
  );
}
