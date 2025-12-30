"use server";

import { revalidatePath } from "next/cache";
import { users, shipments } from "./data";
import type { Shipment, ShipmentStatus, StatusLog, UserProfile } from "./types";
import { correctTimestamp as correctTimestampAI, type CorrectTimestampInput } from "@/ai/flows/admin-assisted-timestamp-correction";

// Simulate a database
let mockShipments: Shipment[] = [...shipments];
let mockUsers: UserProfile[] = [...users];

// --- Data Fetching Actions ---

export async function getShipments(): Promise<Shipment[]> {
  // In a real app, you'd fetch this from Firestore
  return JSON.parse(JSON.stringify(mockShipments));
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
  return JSON.parse(JSON.stringify(mockShipments.find((s) => s.id === id)));
}

export async function getShipmentByOrderCode(
  orderCode: string
): Promise<Shipment | undefined> {
  return JSON.parse(JSON.stringify(
    mockShipments.find(
      (s) => s.orderCode.toLowerCase() === orderCode.toLowerCase()
    )
  ));
}

export async function getDrivers(): Promise<UserProfile[]> {
    return JSON.parse(JSON.stringify(mockUsers.filter(u => u.role === 'driver')));
}

export async function getDriverShipment(driverId: string): Promise<Shipment | undefined> {
    return JSON.parse(JSON.stringify(mockShipments.find(s => s.assignedDriverId === driverId && !s.isCompleted)));
}


// --- Data Mutation Actions ---

export async function createShipmentAction(data: {
  origin: string;
  destination: string;
  driverId: string;
}) {
  const driver = mockUsers.find(u => u.uid === data.driverId);
  if (!driver) {
    return { error: "Invalid driver selected." };
  }

  const newShipment: Shipment = {
    id: `ship${(mockShipments.length + 1).toString().padStart(3, "0")}`,
    orderCode: `TT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    assignedDriverId: data.driverId,
    assignedDriverName: driver.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStatus: "pending",
    statusTimestamps: {},
    isCompleted: false,
    origin: data.origin,
    destination: data.destination,
    statusLogs: [],
  };

  mockShipments.unshift(newShipment);
  revalidatePath("/admin/dashboard");
  return { success: true, shipment: newShipment };
}

export async function updateShipmentStatusAction(shipmentId: string, status: ShipmentStatus, driverId: string) {
    const shipmentIndex = mockShipments.findIndex(s => s.id === shipmentId);
    if (shipmentIndex === -1) return { error: "Shipment not found." };
    
    const driver = mockUsers.find(u => u.uid === driverId);
    if (!driver) return { error: "Driver not found" };

    const now = new Date().toISOString();
    const newLog: StatusLog = {
        id: `log${Date.now()}`,
        status,
        timestamp: now,
        actorId: driverId,
        actorName: driver.name,
        source: 'driver'
    };

    mockShipments[shipmentIndex].currentStatus = status;
    mockShipments[shipmentIndex].statusTimestamps[status] = now;
    mockShipments[shipmentIndex].statusLogs.push(newLog);
    mockShipments[shipmentIndex].updatedAt = now;

    if (status === 'trip_completed') {
        mockShipments[shipmentIndex].isCompleted = true;
    }

    revalidatePath('/driver/dashboard');
    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/shipments/${shipmentId}`);
    revalidatePath(`/track`);

    return { success: true, shipment: mockShipments[shipmentIndex] };
}

export async function correctTimestampAction(data: CorrectTimestampInput) {
    // In a real app, you would call the AI flow and then update Firestore
    try {
        const result = await correctTimestampAI(data);
        
        // Simulate updating the database
        const shipmentIndex = mockShipments.findIndex(s => s.id === data.shipmentId);
        if (shipmentIndex === -1) return { error: "Shipment not found." };

        const admin = mockUsers.find(u => u.role === 'admin');
        if (!admin) return { error: "Admin user not found for logging." };

        const newTimestamp = result.suggestedTimestamp;
        const statusToUpdate = data.statusType as ShipmentStatus;

        mockShipments[shipmentIndex].statusTimestamps[statusToUpdate] = newTimestamp;
        mockShipments[shipmentIndex].updatedAt = new Date().toISOString();

        const newLog: StatusLog = {
            id: `log${Date.now()}`,
            status: statusToUpdate,
            timestamp: newTimestamp,
            actorId: admin.uid,
            actorName: admin.name,
            source: 'admin',
            notes: `Original: ${data.incorrectTimestamp}. AI Reason: ${result.explanation} (Conf: ${result.confidence.toFixed(2)})`
        };
        mockShipments[shipmentIndex].statusLogs.push(newLog);
        
        revalidatePath(`/admin/shipments/${data.shipmentId}`);
        revalidatePath('/admin/dashboard');

        return { success: true, aiSuggestion: result };
    } catch (error) {
        console.error("AI Timestamp Correction Failed:", error);
        return { error: "AI timestamp correction failed. Please try again." };
    }
}
