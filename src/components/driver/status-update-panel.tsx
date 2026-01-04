
"use client";

import { useTransition, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestCorrectionAction, updateShipmentStatusAction } from "@/lib/actions";
import type { Shipment, ShipmentStatus } from "@/lib/types";
import { SHIPMENT_STATUSES, STATUS_DETAILS } from "@/lib/constants";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StatusUpdatePanelProps = {
  shipment: Shipment;
  driverId: string;
};

export function StatusUpdatePanel({ shipment, driverId }: StatusUpdatePanelProps) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isCorrectionPending, startCorrectionTransition] = useTransition();
  const [statusToConfirm, setStatusToConfirm] = useState<ShipmentStatus | null>(null);
  const [isCorrectionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const { toast } = useToast();

  const currentStatusIndex = SHIPMENT_STATUSES.indexOf(
    shipment.currentStatus as any
  );
  const nextStatus =
    shipment.currentStatus === "pending"
      ? SHIPMENT_STATUSES[0]
      : SHIPMENT_STATUSES[currentStatusIndex + 1];

  const handleStatusUpdate = () => {
    if (!statusToConfirm) return;

    startUpdateTransition(async () => {
      const result = await updateShipmentStatusAction({
        shipmentId: shipment.id,
        status: statusToConfirm,
        driverId,
      });
      if (result.error) {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Status Updated!",
          description: `Shipment is now: ${STATUS_DETAILS[statusToConfirm]?.label}`,
        });
      }
      setStatusToConfirm(null); // Close the modal
    });
  };
  
  const handleCorrectionSubmit = () => {
    if (!correctionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the correction.",
        variant: "destructive",
      });
      return;
    }

    startCorrectionTransition(async () => {
        const result = await requestCorrectionAction({
            shipmentId: shipment.id,
            driverId,
            statusToCorrect: shipment.currentStatus,
            reason: correctionReason,
        });

        if (result.error) {
            toast({ title: "Correction Failed", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Correction Request Submitted", description: "An admin will review your request shortly." });
            setCorrectionReason("");
            setCorrectionModalOpen(false);
        }
    });
  };

  const currentStatusDetails = STATUS_DETAILS[shipment.currentStatus];
  const nextStatusDetails = nextStatus ? STATUS_DETAILS[nextStatus] : null;
  const statusToConfirmDetails = statusToConfirm ? STATUS_DETAILS[statusToConfirm] : null;

  const canRequestCorrection = useMemo(() => {
    if (shipment.currentStatus === 'pending' || shipment.isCompleted) return false;
    // Find the log entry for the current status by this driver
    const currentStatusLog = shipment.statusLogs.find(
      log => log.status === shipment.currentStatus && log.actorId === driverId && !log.isCorrection
    );
    // Can request correction if the log exists and is not already flagged
    return !!currentStatusLog && !currentStatusLog.isFlagged;
  }, [shipment.currentStatus, shipment.isCompleted, shipment.statusLogs, driverId]);


  return (
    <>
      <div className="flex h-full min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">
              Shipment: {shipment.orderCode}
            </CardTitle>
            <CardDescription>
              {shipment.origin} to {shipment.destination}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    {canRequestCorrection && (
                        <Dialog open={isCorrectionModalOpen} onOpenChange={setCorrectionModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="link" size="sm" className="text-xs h-auto p-0">
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Made a mistake? Request Correction
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Request Status Correction</DialogTitle>
                                    <DialogDescription>
                                        Requesting a correction for status: <strong>{currentStatusDetails?.label}</strong>. Please provide a reason for the administrator.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="correction-reason" className="sr-only">Reason for correction</Label>
                                    <Textarea 
                                        id="correction-reason"
                                        placeholder="e.g., I accidentally confirmed 'End Loading' too early."
                                        value={correctionReason}
                                        onChange={(e) => setCorrectionReason(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" disabled={isCorrectionPending}>Cancel</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleCorrectionSubmit} disabled={isCorrectionPending}>
                                        {isCorrectionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Request
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                {currentStatusDetails && (
                  <currentStatusDetails.icon className="h-5 w-5" />
                )}
                <span>
                  {currentStatusDetails?.label || shipment.currentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">Next Action:</p>
              {nextStatus && nextStatusDetails ? (
                <Button
                  className="w-full h-24 text-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-4"
                  onClick={() => setStatusToConfirm(nextStatus)}
                  disabled={isUpdatePending}
                >
                  {isUpdatePending && statusToConfirm !== nextStatus ? (
                    <Loader2 className="h-12 w-12 animate-spin" />
                  ) : (
                    <>
                      <nextStatusDetails.icon className="h-10 w-10" />
                      <span>{nextStatusDetails.label}</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center text-muted-foreground p-8 border rounded-lg">
                  <p className="font-semibold">Trip Completed!</p>
                  <p>No further actions required.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!statusToConfirm}
        onOpenChange={(isOpen) => !isOpen && setStatusToConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set this status to{" "}
              <strong>"{statusToConfirmDetails?.label}"</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusUpdate} disabled={isUpdatePending}>
              {isUpdatePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
