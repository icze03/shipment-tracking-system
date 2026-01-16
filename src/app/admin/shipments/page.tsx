
import { getShipments } from "@/lib/data/shipments";
import { ShipmentsPageClient } from "@/components/admin/shipments-page-client";

export default async function AdminShipmentsPage() {
  const shipments = await getShipments();
  return <ShipmentsPageClient shipments={shipments} />;
}
