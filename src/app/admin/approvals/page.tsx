import { getDrivers } from "@/lib/data/drivers";
import { getShipments } from "@/lib/data/shipments";
import { ApprovalsPageClient } from "@/components/admin/approvals-page-client";

export default async function ApprovalsPage() {
  const drivers = await getDrivers();
  const shipments = await getShipments();

  return <ApprovalsPageClient drivers={drivers} shipments={shipments} />;
}
