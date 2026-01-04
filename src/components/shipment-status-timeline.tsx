import { CheckCircle2, Circle, Truck } from "lucide-react";
import type { Shipment } from "@/lib/types";
import { ALL_STATUSES, STATUS_DETAILS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ClientFormattedDate } from "./client-formatted-date";

export function ShipmentStatusTimeline({ shipment }: { shipment: Shipment }) {
  return (
    <ol className="relative border-l border-border ml-3">
      {ALL_STATUSES.map((status, index) => {
        const timestamp = shipment.statusTimestamps[status];
        const isCompleted = !!timestamp;
        const isCurrent = shipment.currentStatus === status && !shipment.isCompleted;
        const details = STATUS_DETAILS[status];

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
            <div className="flex flex-col">
              <h3 className={cn("font-semibold", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                {details.label}
              </h3>
              {isCompleted ? (
                <time className="block text-sm font-normal leading-none text-muted-foreground">
                  <ClientFormattedDate date={timestamp} />
                </time>
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
