
"use client";

import { useTransition, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { acknowledgeCancellationAction, requestCorrectionAction, updateShipmentStatusAction } from "@/lib/actions";
import type { Shipment, ShipmentStatus, StatusLog, Expense } from "@/lib/types";
import { PER_DESTINATION_STATUSES, POST_DELIVERY_STATUSES, PRE_DELIVERY_STATUSES, STATUS_DETAILS } from "@/lib/constants";
import { Loader2, AlertTriangle, History, XCircle, ThumbsUp, MapPin, ListPlus, Flag, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientOnly } from "@/components/client-only";
import { ClientFormattedDate } from "../client-formatted-date";
import Link from "next/link";
import { ExpenseTrackerDialog } from "./expense-tracker-dialog";
import { v4 as uuidv4 } from "uuid";

type StatusUpdatePanelProps = {
  shipment: Shipment;
  driverId: string;
};

export function StatusUpdatePanel({ shipment, driverId }: StatusUpdatePanelProps) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isCorrectionPending, startCorrectionTransition] = useTransition();
  const [isAckPending, startAckTransition] = useTransition();
  
  const [statusToConfirm, setStatusToConfirm] = useState<ShipmentStatus | null>(null);
  
  const [correctionModalState, setCorrectionModalState] = useState<{
    isOpen: boolean;
    logEntry: StatusLog | null;
    reason: string;
  }>({ isOpen: false, logEntry: null, reason: "" });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { toast } = useToast();
  
  const { 
    nextStatus, 
    destinationDisplay,
    nextStatusDetails 
  } = useMemo(() => {
    const currentDestinationIndex = shipment.currentDestinationIndex ?? 0;
    const isFinalDestination = currentDestinationIndex >= shipment.destinations.length - 1;
    const destinationDisplay = `${shipment.destinations[currentDestinationIndex]} (${currentDestinationIndex + 1} of ${shipment.destinations.length})`;

    let nextStatus: ShipmentStatus | null = null;
    
    if (shipment.currentStatus === 'pending') {
      nextStatus = 'arrived_at_warehouse';
    } else if (shipment.currentStatus === 'end_unloading') {
      if (shipment.shipmentType === 'multi_drop' && !isFinalDestination) {
        nextStatus = 'en_route_to_drop_off';
      } else {
        nextStatus = 'trip_completed';
      }
    } else if (shipment.currentStatus === 'en_route_to_drop_off') {
      nextStatus = 'arrived_at_destination';
    } else {
      const allStatuses = [
        ...PRE_DELIVERY_STATUSES,
        ...PER_DESTINATION_STATUSES,
        ...POST_DELIVERY_STATUSES,
      ];
      const linearIndex = allStatuses.indexOf(shipment.currentStatus as any);
      if (linearIndex > -1 && linearIndex < allStatuses.length - 1) {
        nextStatus = allStatuses[linearIndex + 1];
      }
    }
    
    const nextStatusDetails = nextStatus ? STATUS_DETAILS[nextStatus] : null;
    
    return { nextStatus, destinationDisplay, nextStatusDetails };
  }, [shipment]);


  const handleLocationAndStatusUpdate = (expenses?: Expense[]) => {
    if (!statusToConfirm) return;

    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support location services. This is required to update status.",
        variant: "destructive"
      });
      setStatusToConfirm(null);
      return;
    }

    startUpdateTransition(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          performStatusUpdate(statusToConfirm, { latitude, longitude }, expenses);
        },
        (error) => {
          console.warn(`Geolocation error: ${error.message} (Code: ${error.code})`);
          toast({
            title: "Could Not Get Location",
            description: "Location is required to update status. Please check your device's location settings and try again.",
            variant: "destructive"
          });
          // Stop the update process if location fails
          setStatusToConfirm(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const performStatusUpdate = async (status: ShipmentStatus, location: {latitude: number, longitude: number}, expenses?: Expense[]) => {
    const result = await updateShipmentStatusAction({
      shipmentId: shipment.id,
      status: status,
      driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      expenses,
      currentDestinationIndex: shipment.currentDestinationIndex ?? 0,
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
        description: `Shipment is now: ${STATUS_DETAILS[status]?.label}`,
      });
    }
    setStatusToConfirm(null); // Close the modal
    setIsExpenseModalOpen(false); // Close expense modal if it was open
  };
  
  const handleFinalizeTrip = (expenses: Expense[]) => {
     handleLocationAndStatusUpdate(expenses);
  };
  
  const handleCorrectionSubmit = () => {
    if (!correctionModalState.logEntry) return;
    if (!correctionModalState.reason.trim()) {
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
            statusToCorrect: correctionModalState.logEntry!.status,
            reason: correctionModalState.reason,
        });

        if (result.error) {
            toast({ title: "Correction Failed", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Correction Request Submitted", description: "An admin will review your request shortly." });
            setCorrectionModalState({ isOpen: false, logEntry: null, reason: "" });
        }
    });
  };
  
  const handleAcknowledgeCancellation = () => {
    startAckTransition(async () => {
        const result = await acknowledgeCancellationAction(shipment.id, driverId);
         if (result.error) {
            toast({ title: "Acknowledgement Failed", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Cancellation Acknowledged", description: "Your confirmation has been logged." });
        }
    });
  }

  const openCorrectionModal = (log: StatusLog) => {
    setCorrectionModalState({ isOpen: true, logEntry: log, reason: "" });
  };
  
  const closeCorrectionModal = () => {
    if (isCorrectionPending) return;
    setCorrectionModalState({ isOpen: false, logEntry: null, reason: "" });
  }

  const driverLogs = useMemo(() => {
    return shipment.statusLogs
      .filter(log => log.actorId === driverId && !log.isCorrection)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [shipment.statusLogs, driverId]);


  const currentStatusDetails = STATUS_DETAILS[shipment.currentStatus];
  const statusToConfirmDetails = statusToConfirm ? STATUS_DETAILS[statusToConfirm] : null;
  
  const correctionStatusDetails = correctionModalState.logEntry ? STATUS_DETAILS[correctionModalState.logEntry.status] : null;

  const currentDestinationIndex = shipment.currentDestinationIndex ?? 0;
  const currentLegOrigin = currentDestinationIndex === 0 
    ? shipment.origin 
    : shipment.destinations[currentDestinationIndex - 1];
  const currentLegDestination = shipment.destinations.length > currentDestinationIndex 
    ? shipment.destinations[currentDestinationIndex]
    : shipment.destinations[shipment.destinations.length - 1];

  // Render cancellation UI if status is cancelled
  if (shipment.currentStatus === 'cancelled') {
    const wasOnTheWay = !!shipment.statusTimestamps.departed_warehouse;
    const ackButtonText = wasOnTheWay ? "Confirm Product Return" : "Acknowledge & Return to Logistics";

    if (shipment.cancellationAcknowledged) {
        return (
            <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
                <Alert className="max-w-lg">
                    <ThumbsUp className="h-4 w-4" />
                    <AlertTitle>Cancellation Acknowledged</AlertTitle>
                    <AlertDescription>
                        Your confirmation for shipment {shipment.orderCode} has been logged. Please wait for your next assignment.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
            <Alert variant="destructive" className="max-w-lg">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Shipment {shipment.orderCode} Cancelled</AlertTitle>
                <AlertDescription>
                    <div className="space-y-4">
                        <p>This shipment has been cancelled by an administrator.</p>
                        {shipment.cancellationReason && (
                            <div>
                                <h4 className="font-bold">Reason:</h4>
                                <p>{shipment.cancellationReason}</p>
                            </div>
                        )}
                        {shipment.driverInstructions && (
                            <div>
                                <h4 className="font-bold">Next Instructions:</h4>
                                <p>{shipment.driverInstructions}</p>
                            </div>
                        )}
                        <Button 
                            className="w-full mt-4" 
                            onClick={handleAcknowledgeCancellation}
                            disabled={isAckPending}
                        >
                           {isAckPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                           {ackButtonText}
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">
              Shipment: {shipment.orderCode}
            </CardTitle>
            <CardDescription>
              {currentLegOrigin} to {currentLegDestination}
            </CardDescription>
             {shipment.destinations.length > 1 && (
                <Accordion type="single" collapsible className="w-full text-sm">
                    <AccordionItem value="destinations">
                        <AccordionTrigger className="py-2">View all {shipment.destinations.length} drop-off points</AccordionTrigger>
                        <AccordionContent>
                             <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                {shipment.destinations.map((dest, i) => (
                                <li key={i} className={i === (shipment.currentDestinationIndex ?? 0) ? 'font-bold text-foreground' : ''}>
                                    {dest} {i === (shipment.currentDestinationIndex ?? 0) && '(Current)'}
                                </li>
                                ))}
                            </ol>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
             )}
          </CardHeader>
          <CardContent className="space-y-6">
            {shipment.notes && (
              <Accordion type="single" collapsible className="w-full text-sm border-b">
                <AccordionItem value="notes" className="border-b-0">
                  <AccordionTrigger className="py-2 font-semibold text-base">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      View Admin Notes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    <p className="text-muted-foreground whitespace-pre-wrap">{shipment.notes}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {shipment.shipmentType === 'multi_drop' && !shipment.isCompleted && (
              <div>
                <p className="text-sm text-muted-foreground">Current Target</p>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Flag className="h-5 w-5" />
                  <span>{destinationDisplay}</span>
                </div>
              </div>
            )}
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
                <>
                  {nextStatus === 'trip_completed' ? (
                     <Button
                        className="w-full h-24 text-2xl bg-green-600 hover:bg-green-600/90 text-primary-foreground flex items-center justify-center gap-4"
                        onClick={() => {
                            setStatusToConfirm(nextStatus);
                            setIsExpenseModalOpen(true);
                        }}
                        disabled={isUpdatePending}
                    >
                        <ListPlus className="h-10 w-10" />
                        <span>Log Expenses & Complete</span>
                    </Button>
                  ) : (
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
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground p-8 border rounded-lg">
                  <p className="font-semibold">Trip Completed!</p>
                  <p>No further actions required.</p>
                </div>
              )}
            </div>
          </CardContent>

          {driverLogs.length > 0 && (
            <ClientOnly>
                <CardFooter>
                    <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                        <span className="flex items-center gap-2 text-sm">
                            <History className="h-4 w-4" />
                            My Status History
                        </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-4 pt-2">
                                {driverLogs.map(log => (
                                <li key={log.id} className="text-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{STATUS_DETAILS[log.status]?.label}</p>
                                            <p className="text-xs text-muted-foreground"><ClientFormattedDate date={log.timestamp} /></p>
                                             {log.latitude && log.longitude && (
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>
                                                    {log.latitude.toFixed(5)}, {log.longitude.toFixed(5)}
                                                </span>
                                                <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs ml-1">
                                                    <Link href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`} target="_blank" rel="noopener noreferrer">
                                                    View Map
                                                    </Link>
                                                </Button>
                                                </div>
                                            )}
                                        </div>
                                        {log.isFlagged ? (
                                            <span className="text-xs text-destructive font-medium">Correction Pending</span>
                                        ) : (
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="text-xs h-auto p-0"
                                                onClick={() => openCorrectionModal(log)}
                                            >
                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                Request Correction
                                            </Button>
                                        )}
                                    </div>
                                </li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    </Accordion>
                </CardFooter>
            </ClientOnly>
          )}

        </Card>

      <ClientOnly>
        <AlertDialog
            open={!!statusToConfirm && !isExpenseModalOpen}
            onOpenChange={(isOpen) => !isOpen && setStatusToConfirm(null)}
        >
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                <AlertDialogDescription>
                    This will record your current location. Are you sure you want to set the status to{" "}
                    <strong>"{statusToConfirmDetails?.label}"</strong>?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isUpdatePending}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleLocationAndStatusUpdate()} disabled={isUpdatePending}>
                {isUpdatePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        <ExpenseTrackerDialog
            isOpen={isExpenseModalOpen}
            onClose={() => {
                setIsExpenseModalOpen(false);
                setStatusToConfirm(null);
            }}
            onSave={handleFinalizeTrip}
            isSaving={isUpdatePending}
        />
      </ClientOnly>

      <ClientOnly>
        <Dialog open={correctionModalState.isOpen} onOpenChange={closeCorrectionModal}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Request Status Correction</DialogTitle>
                <DialogDescription>
                Requesting a correction for status:{" "}
                <strong>{correctionStatusDetails?.label}</strong> logged at{" "}
                <ClientFormattedDate date={correctionModalState.logEntry?.timestamp} />. Please provide a reason for the administrator.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="correction-reason" className="sr-only">
                Reason for correction
                </Label>
                <Textarea
                id="correction-reason"
                placeholder="e.g., I accidentally confirmed 'End Loading' too early."
                value={correctionModalState.reason}
                onChange={(e) => setCorrectionModalState(prev => ({...prev, reason: e.target.value }))}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isCorrectionPending}>
                    Cancel
                </Button>
                </DialogClose>
                <Button type="button" onClick={handleCorrectionSubmit} disabled={isCorrectionPending}>
                {isCorrectionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      </ClientOnly>
    </>
  );
}
