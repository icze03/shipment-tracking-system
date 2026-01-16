
"use client";

import type { Shipment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Flag, MapPin } from "lucide-react";
import { STATUS_DETAILS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

type DriverShipmentCardProps = {
    shipment: Shipment;
};

export function DriverShipmentCard({ shipment }: DriverShipmentCardProps) {
    const statusDetail = STATUS_DETAILS[shipment.currentStatus];
    const finalDestination = shipment.destinations[shipment.destinations.length - 1];
    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                        {shipment.orderCode}
                    </CardTitle>
                    <Badge variant="outline">Queued</Badge>
                </div>
                <CardDescription>
                    {shipment.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>From: {shipment.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    <span>To: {finalDestination}</span>
                </div>
                 {shipment.destinations.length > 1 && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>({shipment.destinations.length} total stops)</span>
                    </div>
                 )}
                <div className="flex items-center gap-2 pt-2">
                    {statusDetail?.icon && <statusDetail.icon className="h-4 w-4" />}
                    <span>Status: {statusDetail?.label ?? "Unknown"}</span>
                </div>
            </CardContent>
        </Card>
    );
}
