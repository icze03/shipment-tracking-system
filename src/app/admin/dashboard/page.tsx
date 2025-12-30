import { getShipments } from "@/lib/data/shipments";
import { DashboardClientContent } from "@/components/admin/dashboard-client";

export default async function AdminDashboardPage() {
  const shipments = await getShipments();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Dashboard</h2>
        <p className="text-muted-foreground">
          A quick overview of your logistics operation.
        </p>
      </div>
      <DashboardClientContent shipments={shipments} />
    </div>
  );
}
