import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PRE_DELIVERY_STATUSES, PER_DESTINATION_STATUSES, POST_DELIVERY_STATUSES } from "@/lib/constants";
import type { Shipment } from "@/lib/types";

export function StatusProgress({ shipment }: { shipment: Shipment }) {
  const completedStatuses = Object.keys(shipment.statusTimestamps).length;
  
  let totalStatuses = 0;
  if (shipment.currentStatus === 'cancelled') {
    totalStatuses = completedStatuses; // Or just 1/1
  } else {
    const preDeliveryCount = PRE_DELIVERY_STATUSES.filter(s => s !== 'pending').length;
    const postDeliveryCount = POST_DELIVERY_STATUSES.length;
    
    if (shipment.shipmentType === 'single_drop') {
      totalStatuses = preDeliveryCount + PER_DESTINATION_STATUSES.length + postDeliveryCount;
    } else {
      const numDestinations = shipment.destinations.length;
      if (numDestinations > 0) {
        const perDestinationCount = numDestinations * PER_DESTINATION_STATUSES.length;
        const interDestinationCount = numDestinations > 1 ? numDestinations - 1 : 0;
        totalStatuses = preDeliveryCount + perDestinationCount + interDestinationCount + postDeliveryCount;
      } else {
        totalStatuses = preDeliveryCount + postDeliveryCount;
      }
    }
  }

  const progressPercentage = totalStatuses > 0 ? (completedStatuses / totalStatuses) * 100 : (shipment.isCompleted ? 100 : 0);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Progress value={progressPercentage} className="w-24 h-2" />
            <span className="text-xs text-muted-foreground">
              {completedStatuses}/{totalStatuses}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {completedStatuses} of {totalStatuses} stages completed.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
