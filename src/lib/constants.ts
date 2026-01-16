import type { ShipmentStatus } from "./types";
import {
  Warehouse,
  PackageOpen,
  Package,
  Send,
  MapPin,
  CheckCircle2,
  Truck,
  Timer,
  Container,
  Anchor,
  XCircle,
  ThumbsUp,
  ChevronsRight,
} from "lucide-react";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "arrived_at_warehouse",
  "start_loading",
  "end_loading",
  "departed_warehouse",
  "arrived_at_destination",
  "start_unloading",
  "end_unloading",
  "trip_completed",
];

export const ALL_STATUSES: ShipmentStatus[] = [
  "pending",
  ...SHIPMENT_STATUSES,
  "en_route_to_drop_off",
  "cancellation_acknowledged",
];

export const STATUS_DETAILS: Record<
  ShipmentStatus,
  { label: string; icon: React.ComponentType<any> }
> = {
  pending: { label: "Pending", icon: Timer },
  arrived_at_warehouse: { label: "Arrived at Warehouse", icon: Warehouse },
  start_loading: { label: "Start Loading", icon: PackageOpen },
  end_loading: { label: "Finish Loading", icon: Package },
  departed_warehouse: { label: "Depart from Warehouse", icon: Send },
  en_route_to_drop_off: { label: "En Route to Next Drop-off", icon: ChevronsRight },
  arrived_at_destination: { label: "Arrived at Destination", icon: Anchor },
  start_unloading: { label: "Start Unloading", icon: Container },
  end_unloading: { label: "Finish Unloading", icon: MapPin },
  trip_completed: { label: "Trip Completed", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", icon: XCircle },
  cancellation_acknowledged: { label: "Cancellation Acknowledged", icon: ThumbsUp },
};
