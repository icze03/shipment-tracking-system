export type UserRole = "admin" | "driver";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    status: "active" | "inactive" | "on-leave";
}

export type ShipmentStatus =
  | "pending"
  | "arrived_at_warehouse"
  | "start_loading"
  | "end_loading"
  | "departed_warehouse"
  | "arrived_at_destination"
  | "start_unloading"
  | "end_unloading"
  | "trip_completed";

export type StatusLog = {
  id: string;
  status: ShipmentStatus;
  timestamp: string;
  actorId: string;
  actorName: string;
  source: "driver" | "admin";
  notes?: string;
};

export interface Shipment {
  id: string;
  orderCode: string;
  description: string;
  notes?: string;
  assignedDriverId: string;
  assignedDriverName: string;
  createdAt: string;
  updatedAt: string;
  currentStatus: ShipmentStatus;
  statusTimestamps: Partial<Record<ShipmentStatus, string>>;
  statusLogs: StatusLog[];
  isCompleted: boolean;
  destination: string;
  origin: string;
}
