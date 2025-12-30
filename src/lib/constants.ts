import type { ShipmentStatus } from "./types";
import {
  Warehouse,
  PackageOpen,
  Package,
  Send,
  MapPin,
  CheckCircle2,
  Undo2,
  Flag,
  Truck,
  Timer,
} from "lucide-react";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "arrived_at_warehouse",
  "start_loading",
  "end_loading",
  "departed_warehouse",
  "arrived_at_destination",
  "delivered",
  "trip_completed",
];

export const ALL_STATUSES: ShipmentStatus[] = [
  "pending",
  ...SHIPMENT_STATUSES,
  "returned_to_origin",
];

export const STATUS_DETAILS: Record<
  ShipmentStatus,
  { label: string; icon: React.ComponentType<any> }
> = {
  pending: { label: "Pending", icon: Timer },
  arrived_at_warehouse: { label: "Arrived at Warehouse", icon: Warehouse },
  start_loading: { label: "Start Loading", icon: PackageOpen },
  end_loading: { label: "End Loading", icon: Package },
  departed_warehouse: { label: "Departed Warehouse", icon: Send },
  arrived_at_destination: { label: "Arrived at Destination", icon: MapPin },
  delivered: { label: "Delivered", icon: CheckCircle2 },
  returned_to_origin: { label: "Returned to Origin", icon: Undo2 },
  trip_completed: { label: "Trip Completed", icon: Flag },
};
