
"use client"; // To read search params

import { useSearchParams } from 'next/navigation'
import type { Driver, Shipment } from "@/lib/types";
import { DriverApprovalList } from "@/components/admin/driver-approval-list";
import { ShipmentCorrectionList } from "@/components/admin/shipment-correction-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This is the client component part that handles interactivity
function ApprovalsPageContent({ drivers, shipments }: { drivers: Driver[], shipments: Shipment[] }) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'corrections' ? 'corrections' : 'drivers';

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
      <Tabs defaultValue={defaultTab}>
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

// This is the main page component, now a Server Component that fetches data
export default async function ApprovalsPage() {
  const { getDrivers } = await import('@/lib/data/drivers');
  const { getShipments } = await import('@/lib/data/shipments');

  // Data is fetched on the server
  const drivers = await getDrivers();
  const shipments = await getShipments();
  
  // The data is passed as props to the client component
  return <ApprovalsPageContent drivers={drivers} shipments={shipments} />;
}
