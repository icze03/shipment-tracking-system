import { CheckCircle2, Circle, Truck, MapPin } from "lucide-react";
import type { Shipment } from "@/lib/types";
import { ALL_STATUSES, STATUS_DETAILS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ClientFormattedDate } from "./client-formatted-date";
import { Button } from "./ui/button";
import Link from "next/link";

export function ShipmentStatusTimeline({ shipment }: { shipment: Shipment }) {
  // Create a map of status to the most recent log entry for that status for quick lookup.
  const latestLogForStatus = shipment.statusLogs.reduce((acc, log) => {
    // Only consider logs that aren't corrections and are more recent.
    if (!log.isCorrection) {
      if (!acc[log.status] || new Date(log.timestamp) > new Date(acc[log.status]!.timestamp)) {
        acc[log.status] = log;
      }
    }
    return acc;
  }, {} as Record<string, typeof shipment.statusLogs[0]>);

  return (
    <ol className="relative border-l border-border ml-3">
      {ALL_STATUSES.map((status, index) => {
        const timestamp = shipment.statusTimestamps[status];
        const isCompleted = !!timestamp;
        const isCurrent = shipment.currentStatus === status && !shipment.isCompleted;
        const details = STATUS_DETAILS[status];
        const logEntry = latestLogForStatus[status];

        if (!details) return null;

        return (
          <li key={status} className="mb-10 ml-6">
            <span
              className={cn(
                "absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-8 ring-background",
                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {isCurrent ? (
                <Truck className="h-4 w-4 animate-pulse" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <details.icon className="h-4 w-4" />
              )}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className={cn("font-semibold", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                {details.label}
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
