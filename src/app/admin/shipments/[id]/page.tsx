import { getShipmentById } from "@/lib/data/shipments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, MapPin, Flag, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { STATUS_DETAILS } from "@/lib/constants";
import type { StatusLog } from "@/lib/types";
import { ShipmentStatusTimeline } from "@/components/shipment-status-timeline";
import { Badge } from "@/components/ui/badge";

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
              <CardTitle className="text-2xl">
                Shipment {shipment.orderCode}
              </CardTitle>
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
                  <span>Created: {formatDate(shipment.createdAt)}</span>
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

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>History of all status changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipment.statusLogs.length > 0 ? (
                shipment.statusLogs.slice().reverse().map((log: StatusLog) => (
                  <div key={log.id} className="text-sm">
                    <div className="flex items-center justify-between">
                       <p className="font-medium">
                        {STATUS_DETAILS[log.status]?.label || log.status}
                      </p>
                      {log.source === 'driver-correction-request' && (
                        <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Correction
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      by {log.actorName} ({log.source === 'driver-correction-request' ? 'Driver Request' : log.source})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </p>
                    {log.notes && <p className="mt-1 text-xs text-muted-foreground border-l-2 pl-2">{log.notes}</p>}
                    {log.correctionReason && <p className="mt-1 text-xs text-amber-600 border-l-2 border-amber-500 pl-2">Reason: {log.correctionReason}</p>}
                    <Separator className="mt-4" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No log entries yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
