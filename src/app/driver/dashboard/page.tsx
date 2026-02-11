
import { DriverDashboardClient } from "@/components/driver/driver-dashboard-client";
import { ClientOnly } from "@/components/client-only";

export default async function DriverDashboardPage() {
  return (
    <ClientOnly>
      <DriverDashboardClient />
    </ClientOnly>
  );
}
