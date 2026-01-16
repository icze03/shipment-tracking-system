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

// The sequence of statuses before any drop-offs
export const PRE_DELIVERY_STATUSES: ShipmentStatus[] = [
  'pending',
  'arrived_at_warehouse',
  'start_loading',
  'end_loading',
  'departed_warehouse',
];

// The sequence of statuses for each drop-off
export const PER_DESTINATION_STATUSES: ShipmentStatus[] = [
  'arrived_at_destination',
  'start_unloading',
  'end_unloading',
];

// The status for traveling between drop-offs
export const INTER_DESTINATION_STATUS: ShipmentStatus = 'en_route_to_drop_off';

// The final statuses after all drop-offs are complete
export const POST_DELIVERY_STATUSES: ShipmentStatus[] = [
  'trip_completed',
];

// All possible statuses for logic, not for linear display
export const ALL_POSSIBLE_STATUSES: ShipmentStatus[] = [
  ...new Set([ // Use Set to remove duplicates
    ...PRE_DELIVERY_STATUSES,
    ...PER_DESTINATION_STATUSES,
    INTER_DESTINATION_STATUS,
    ...POST_DELIVERY_STATUSES,
    'cancelled',
    'cancellation_acknowledged'
  ])
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
