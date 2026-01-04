
"use client";

import { useMemo } from "react";
import type { Shipment, StatusLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_DETAILS } from "@/lib/constants";
import { TimestampCorrectionModal } from "@/components/admin/timestamp-correction-modal";

type ShipmentDetailClientProps = {
  shipment: Shipment;
};

export function ShipmentDetailClient({ shipment }: ShipmentDetailClientProps) {
  
  const sortedLogs = useMemo(() => {
    return shipment.statusLogs.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [shipment.statusLogs]);

  return (
    <Card className="md:col-span-1">
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
                  {formatDate(log.timestamp)}
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
  );
}
