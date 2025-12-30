import { Suspense } from "react";
import { getShipmentByOrderCode } from "@/lib/data/shipments";
import { PublicHeader } from "@/components/layout/public-header";
import { TrackShipmentForm } from "@/components/track-shipment-form";
import { ShipmentStatusTimeline } from "@/components/shipment-status-timeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search } from "lucide-react";

type TrackPageProps = {
  searchParams: {
    orderCode?: string;
  };
};

export default function TrackPage({ searchParams }: TrackPageProps) {
  const orderCode = searchParams.orderCode;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl py-12 px-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <Search className="w-6 h-6 text-primary" />
                Track Your Shipment
              </CardTitle>
              <CardDescription>
                Enter your order code below to see the latest status of your shipment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrackShipmentForm currentOrderCode={orderCode} />
            </CardContent>
          </Card>

          {orderCode && (
            <Suspense fallback={<p className="mt-8 text-center">Loading shipment status...</p>}>
              <ShipmentDetails orderCode={orderCode} />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

async function ShipmentDetails({ orderCode }: { orderCode: string }) {
  const shipment = await getShipmentByOrderCode(orderCode);

  if (!shipment) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertTitle>Shipment Not Found</AlertTitle>
        <AlertDescription>
          We couldn't find a shipment with the order code "{orderCode}". Please check the code and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2 font-headline">Status for {shipment.orderCode}</h2>
      <p className="text-muted-foreground mb-6">From <span className="font-medium text-foreground">{shipment.origin}</span> to <span className="font-medium text-foreground">{shipment.destination}</span>.</p>
      <ShipmentStatusTimeline shipment={shipment} />
    </div>
  );
}
