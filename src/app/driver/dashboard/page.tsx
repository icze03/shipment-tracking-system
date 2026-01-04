
import { getDriverShipments } from "@/lib/data/shipments";
import { getMockUserAction } from "@/lib/actions";
import { DriverDashboardClient } from "@/components/driver/driver-dashboard-client";

export default async function DriverDashboardPage() {
  // Fetch initial data on the server
  const driver = await getMockUserAction("driver");
  const shipments = driver ? await getDriverShipments(driver.id) : [];

  return <DriverDashboardClient initialDriver={driver} initialShipments={shipments} />;
}
