
"use client";

import { useMemo, useState, useTransition } from "react";
import type { Shipment, StatusLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Edit, Loader2, XCircle } from "lucide-react";
import { STATUS_DETAILS } from "@/lib/constants";
import { TimestampCorrectionModal } from "@/components/admin/timestamp-correction-modal";
import { ClientFormattedDate } from "../client-formatted-date";
import { useToast } from "@/hooks/use-toast";
import { cancelShipmentAction } from "@/lib/actions";

type ShipmentDetailClientProps = {
  shipment: Shipment;
};

export function ShipmentDetailClient({ shipment }: ShipmentDetailClientProps) {
  const { toast } = useToast();
  const [isCancelPending, startCancelTransition] = useTransition();

  const handleCancelShipment = () => {
    startCancelTransition(async () => {
      const result = await cancelShipmentAction(shipment.id);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Shipment Cancelled", description: "The shipment has been successfully cancelled." });
      }
    });
  };

  const sortedLogs = useMemo(() => {
    return shipment.statusLogs.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [shipment.statusLogs]);

  const canCancel = !shipment.isCompleted && shipment.currentStatus !== 'cancelled';

  return (
    <div className="md:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>History of all status changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedLogs.length > 0 ? (
              sortedLogs.map((log: StatusLog) => (
                <div key={log.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium flex items-center gap-2">
                      {log.isCorrection && <Edit className="h-3 w-3 text-muted-foreground" title="Admin Correction" />}
                      {STATUS_DETAILS[log.status]?.label || log.status}
                    </p>
                    {log.isFlagged && (
                      <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Correction Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    by {log.actorName} ({log.source})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <ClientFormattedDate date={log.timestamp} />
                  </p>
                  
                  {log.isFlagged && log.correctionReason && (
                     <p className="mt-2 text-xs text-destructive border-l-2 border-destructive pl-2 italic">
                       Driver's Reason: {log.correctionReason}
                     </p>
                  )}
  
                  {log.isFlagged && (
                     <div className="mt-2">
                       <TimestampCorrectionModal 
                          shipment={shipment} 
                          logToCorrect={log} 
                       />
                     </div>
                  )}
                  
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
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Manage this shipment.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={!canCancel}>
                <XCircle className="mr-2" />
                Cancel Shipment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently cancel the
                  shipment with order code{" "}
                  <span className="font-bold">{shipment.orderCode}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelShipment} disabled={isCancelPending}>
                  {isCancelPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Cancellation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
        {!canCancel && (
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    This shipment cannot be cancelled because it is already completed or has been cancelled.
                </p>
            </CardFooter>
        )}
      </Card>

    </div>
  );
}
