import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
TooltipTrigger,
} from "@/components/ui/tooltip";
import { SHIPMENT_STATUSES } from "@/lib/constants";
import type { Shipment } from "@/lib/types";

export function StatusProgress({ shipment }: { shipment: Shipment }) {
  const completedStatuses = Object.keys(shipment.statusTimestamps).filter(
    (status) => SHIPMENT_STATUSES.includes(status as any)
  ).length;

  const totalStatuses = SHIPMENT_STATUSES.length;
  const progressPercentage = (completedStatuses / totalStatuses) * 100;

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
