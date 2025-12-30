import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "driver";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ShipmentStatus =
  | "pending"
  | "arrived_at_warehouse"
  | "start_loading"
  | "end_loading"
  | "departed_warehouse"
  | "arrived_at_destination"
  | "delivered"
  | "returned_to_origin"
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
  assignedDriverId: string;
  assignedDriverName: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  currentStatus: ShipmentStatus;
  statusTimestamps: Partial<Record<ShipmentStatus, string>>;
  statusLogs: StatusLog[];
  isCompleted: boolean;
  destination: string;
  origin: string;
}
