
import { getDrivers } from "@/lib/data/drivers";
import { DriverApprovalList } from "@/components/admin/driver-approval-list";
import { getShipments } from "@/lib/data/shipments";
import { ShipmentCorrectionList } from "@/components/admin/shipment-correction-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ApprovalsPage() {
  const drivers = await getDrivers();
  const shipments = await getShipments();
  
  const pendingDrivers = drivers.filter(d => d.status === 'pending');
  const shipmentsWithFlags = shipments.filter(s => s.statusLogs.some(log => log.isFlagged));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Action Required</h2>
        <p className="text-muted-foreground">
          Review pending driver registrations and shipment correction requests.
        </p>
      </div>
      <Tabs defaultValue="drivers">
        <TabsList>
          <TabsTrigger value="drivers">Driver Approvals ({pendingDrivers.length})</TabsTrigger>
          <TabsTrigger value="corrections">Shipment Corrections ({shipmentsWithFlags.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers">
            <DriverApprovalList drivers={pendingDrivers} />
        </TabsContent>
        <TabsContent value="corrections">
            <ShipmentCorrectionList shipments={shipmentsWithFlags} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
