import { getShipments } from "@/lib/data/shipments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";
import { ShipmentDataTable } from "@/components/admin/shipment-data-table";
import { columns } from "@/components/admin/shipment-columns";

export default async function AdminDashboardPage() {
  const shipments = await getShipments();

  const statusCounts = shipments.reduce(
    (acc, shipment) => {
      if (shipment.isCompleted) {
        acc.completed++;
      } else if (shipment.currentStatus === "pending") {
        acc.pending++;
      } else {
        acc.inTransit++;
      }
      return acc;
    },
    { total: shipments.length, inTransit: 0, completed: 0, pending: 0 }
  );

  const statCards = [
    { title: "Total Shipments", value: statusCounts.total, icon: Truck },
    { title: "In Transit", value: statusCounts.inTransit, icon: Package },
    { title: "Completed", value: statusCounts.completed, icon: CheckCircle },
    { title: "Pending", value: statusCounts.pending, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Dashboard</h2>
        <p className="text-muted-foreground">
          A quick overview of your logistics operation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight font-headline mb-2">Recent Shipments</h3>
        <ShipmentDataTable columns={columns} data={shipments.slice(0, 10)} />
      </div>
    </div>
  );
}
