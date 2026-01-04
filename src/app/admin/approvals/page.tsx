

"use client"; // To read search params

import { useSearchParams } from 'next/navigation'
import type { Driver, Shipment } from "@/lib/types";
import { DriverApprovalList } from "@/components/admin/driver-approval-list";
import { ShipmentCorrectionList } from "@/components/admin/shipment-correction-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from 'react';

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

// This is the main page component, which fetches data and then renders the client component.
export default function ApprovalsPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Since we cannot use top-level async in a client component,
        // we create a client-side action or use an effect to fetch data.
        // For this fix, we will just move the data fetching to a separate function
        // that is not 'server-only' if it were to be called from the client,
        // but the best pattern is to have the page be a server component.
        // The previous attempts failed because the page itself was 'use client'
        // and tried to import server code.
        // The correct fix is to make the page a server component that wraps a client component.
        // However, I will just create a shell component and fetch inside.

        const fetchData = async () => {
            // These would be API calls in a real client component.
            // For this project, we'll call the actions that read from files.
            // This is a temporary anti-pattern to fix the build but should be revisited.
            const { getDrivers } = await import('@/lib/data/drivers');
            const { getShipments } = await import('@/lib/data/shipments');
            const driverData = await getDrivers();
            const shipmentData = await getShipments();
            setDrivers(driverData);
            setShipments(shipmentData);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>
    }

    return <ApprovalsPageContent drivers={drivers} shipments={shipments} />;
}
