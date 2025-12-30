import { getShipmentById } from "@/lib/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, MapPin, Flag, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { ALL_STATUSES, STATUS_DETAILS } from "@/lib/constants";
import type { StatusLog } from "@/lib/types";
import { TimestampCorrectionModal } from "@/components/admin/timestamp-correction-modal";

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
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Shipment {shipment.orderCode}
              </CardTitle>
              <CardDescription>
                From {shipment.origin} to {shipment.destination}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>All recorded status updates for this shipment.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {ALL_STATUSES.map(status => {
                  const details = STATUS_DETAILS[status];
                  const timestamp = shipment.statusTimestamps[status];
                  if (!details) return null;
                  
                  return (
                    <li key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <details.icon className="h-4 w-4"/>
                        </div>
                        <span className="font-medium">{details.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">{formatDate(timestamp)}</span>
                        {timestamp && <TimestampCorrectionModal shipment={shipment} status={status} />}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>History of all changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipment.statusLogs.length > 0 ? (
                shipment.statusLogs.slice().reverse().map((log: StatusLog) => (
                  <div key={log.id} className="text-sm">
                    <p className="font-medium">
                      {STATUS_DETAILS[log.status]?.label || log.status}
                    </p>
                    <p className="text-muted-foreground">
                      by {log.actorName} ({log.source})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </p>
                    {log.notes && <p className="mt-1 text-xs text-muted-foreground border-l-2 pl-2">{log.notes}</p>}
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
