"use client";

import { useMemo } from "react";
import { Truck, MapPin } from "lucide-react";
import type { Shipment, ShipmentStatus } from "@/lib/types";
import {
  STATUS_DETAILS,
  PRE_DELIVERY_STATUSES,
  PER_DESTINATION_STATUSES,
  INTER_DESTINATION_STATUS,
  POST_DELIVERY_STATUSES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ClientFormattedDate } from "./client-formatted-date";
import { Button } from "./ui/button";
import Link from "next/link";

// Helper function to create a unique key for a status at a specific destination index
const getStatusKey = (status: ShipmentStatus, index: number) => `${status}_${index}`;

export function ShipmentStatusTimeline({ shipment }: { shipment: Shipment }) {
  // Generate the expected sequence of statuses dynamically
  const expectedTimeline = useMemo(() => {
    let timeline: { status: ShipmentStatus; destinationIndex?: number, label: string }[] = [];

    // 1. Pre-delivery statuses
    timeline.push(...PRE_DELIVERY_STATUSES.map(s => ({ status: s, label: STATUS_DETAILS[s].label })));

    // 2. Per-destination statuses
    shipment.destinations.forEach((destination, index) => {
      // Add 'en_route_to_drop_off' between destinations
      if (index > 0 && shipment.shipmentType === 'multi_drop') {
        timeline.push({ 
          status: INTER_DESTINATION_STATUS, 
          destinationIndex: index,
          label: `${STATUS_DETAILS[INTER_DESTINATION_STATUS].label} to ${destination}`
        });
      }
      
      // Add per-destination statuses with specific labels
      PER_DESTINATION_STATUSES.forEach(s => {
        timeline.push({ 
            status: s, 
            destinationIndex: index,
            label: `${STATUS_DETAILS[s].label} at ${destination}`
        });
      });
    });

    // 3. Post-delivery statuses
    timeline.push(...POST_DELIVERY_STATUSES.map(s => ({ status: s, label: STATUS_DETAILS[s].label })));
    
    return timeline;
  }, [shipment.destinations, shipment.shipmentType]);

  // Create a map of status log entries for quick lookup
  const latestLogForStatus = useMemo(() => {
    return shipment.statusLogs.reduce((acc, log) => {
      if (!log.isCorrection) {
        const key = log.destinationIndex !== undefined 
          ? getStatusKey(log.status, log.destinationIndex) 
          : log.status;
        
        // Always take the most recent log for a given key
        if (!acc[key] || new Date(log.timestamp) > new Date(acc[key]!.timestamp)) {
          acc[key] = log;
        }
      }
      return acc;
    }, {} as Record<string, typeof shipment.statusLogs[0]>);
  }, [shipment.statusLogs]);

  // Handle cancelled shipments separately
  if (shipment.currentStatus === 'cancelled') {
    const cancelLog = shipment.statusLogs.find(log => log.status === 'cancelled');
    return (
      <div className="text-destructive font-semibold border-l-4 border-destructive pl-4 py-2">
        <p>Shipment Cancelled</p>
        {cancelLog && (
          <time className="block text-sm font-normal leading-none text-muted-foreground">
              <ClientFormattedDate date={cancelLog.timestamp} />
          </time>
        )}
      </div>
    )
  }

  return (
    <ol className="relative border-l border-border ml-3">
      {expectedTimeline.map(({ status, destinationIndex, label }, index) => {
        const uniqueKey = destinationIndex !== undefined ? getStatusKey(status, destinationIndex) : status;
        const timestamp = shipment.statusTimestamps[uniqueKey as keyof typeof shipment.statusTimestamps];
        const isCompleted = !!timestamp;
        
        // Determine if the current status is this one
        const isCurrent = (shipment.currentStatus === status) && (shipment.currentDestinationIndex ?? 0) === (destinationIndex ?? 0) && !shipment.isCompleted;

        const details = STATUS_DETAILS[status];
        const logEntry = latestLogForStatus[uniqueKey];

        if (!details) return null;

        // Skip rendering 'en_route' if it's a single drop
        if (status === INTER_DESTINATION_STATUS && shipment.shipmentType === 'single_drop') return null;

        return (
          <li key={`${uniqueKey}_${index}`} className="mb-10 ml-6">
            <span
              className={cn(
                "absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-8 ring-background",
                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                isCurrent && "bg-accent text-accent-foreground animate-pulse"
              )}
            >
              {isCurrent ? (
                <Truck className="h-4 w-4" />
              ) : (
                <details.icon className="h-4 w-4" />
              )}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className={cn("font-semibold", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </h3>
              {isCompleted ? (
                <>
                  <time className="block text-sm font-normal leading-none text-muted-foreground">
                    <ClientFormattedDate date={timestamp} />
                  </time>
                  {logEntry?.latitude && logEntry?.longitude && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {logEntry.latitude.toFixed(4)}, {logEntry.longitude.toFixed(4)}
                      </span>
                      <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs ml-1">
                        <Link href={`https://www.google.com/maps/search/?api=1&query=${logEntry.latitude},${logEntry.longitude}`} target="_blank" rel="noopener noreferrer">
                          View Map
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Pending</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
