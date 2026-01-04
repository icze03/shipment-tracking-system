import { getShipmentById } from "@/lib/data/shipments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, MapPin, Flag, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShipmentStatusTimeline } from "@/components/shipment-status-timeline";
import { ShipmentDetailClient } from "@/components/admin/shipment-detail-client";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_DETAILS } from "@/lib/constants";

type ShipmentDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const shipment = await getShipmentById(params.id);

  if (!shipment) {
    notFound();
  }

  const isCancelled = shipment.currentStatus === 'cancelled';

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/shipments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shipments
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Shipment {shipment.orderCode}
                </CardTitle>
                {isCancelled && (
                  <Badge variant="destructive" className="text-base">Cancelled</Badge>
                )}
              </div>
              <CardDescription>
                {shipment.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Driver: {shipment.assignedDriverName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: <ClientFormattedDate date={shipment.createdAt} /></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Origin: {shipment.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span>Destination: {shipment.destination}</span>
                </div>
                {shipment.notes && (
                  <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex flex-col">
                      <span className="font-medium">Notes:</span>
                      <p className="text-muted-foreground">{shipment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>All recorded status updates for this shipment.</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentStatusTimeline shipment={shipment} />
            </CardContent>
          </Card>
        </div>

        <ShipmentDetailClient shipment={shipment} />

      </div>
    </div>
  );
}
