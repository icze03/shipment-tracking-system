"use client";

import { useTransition, useState } from "react";
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
import { updateShipmentStatusAction } from "@/lib/actions";
import type { Shipment, ShipmentStatus } from "@/lib/types";
import { SHIPMENT_STATUSES, STATUS_DETAILS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StatusUpdatePanelProps = {
  shipment: Shipment;
  driverId: string;
};

export function StatusUpdatePanel({ shipment, driverId }: StatusUpdatePanelProps) {
  const [isPending, startTransition] = useTransition();
  const [statusToConfirm, setStatusToConfirm] = useState<ShipmentStatus | null>(null);
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

    startTransition(async () => {
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

  const currentStatusDetails = STATUS_DETAILS[shipment.currentStatus];
  const nextStatusDetails = nextStatus ? STATUS_DETAILS[nextStatus] : null;
  const statusToConfirmDetails = statusToConfirm ? STATUS_DETAILS[statusToConfirm] : null;

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
              <p className="text-sm text-muted-foreground">Current Status</p>
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
                  disabled={isPending}
                >
                  {isPending && statusToConfirm !== nextStatus ? (
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
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusUpdate} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
