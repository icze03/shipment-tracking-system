
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, writeBatch, serverTimestamp, query, where } from "firebase/firestore";
import { getSdks } from "@/firebase/server";
import type { Shipment, ShipmentStatus, StatusLog, UserProfile } from "./types";
import { correctTimestamp as correctTimestampAI, type CorrectTimestampInput } from "@/ai/flows/admin-assisted-timestamp-correction";

async function getFirestore() {
  const { firestore } = await getSdks();
  return firestore;
}

// --- Data Fetching Actions ---

export async function getShipments(): Promise<Shipment[]> {
  const firestore = await getFirestore();
  const shipmentsCol = collection(firestore, "shipments");
  const snapshot = await getDocs(query(shipmentsCol));
  if (snapshot.empty) return [];
  const shipments = await Promise.all(snapshot.docs.map(d => getShipmentById(d.id)));
  return shipments.filter(s => s !== undefined) as Shipment[];
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
    const firestore = await getFirestore();
    const shipmentDoc = doc(firestore, "shipments", id);
    const snapshot = await getDoc(shipmentDoc);
    if (!snapshot.exists()) return undefined;

    // Fetch subcollection
    const statusLogsCol = collection(firestore, `shipments/${id}/statusLogs`);
    const statusLogsSnapshot = await getDocs(query(statusLogsCol));
    const statusLogs = statusLogsSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as StatusLog));

    return { ...snapshot.data(), id: snapshot.id, statusLogs } as Shipment;
}

export async function getShipmentByOrderCode(
  orderCode: string
): Promise<Shipment | undefined> {
    const firestore = await getFirestore();
    const shipmentsCol = collection(firestore, "shipments");
    const q = query(shipmentsCol, where("orderCode", "==", orderCode.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    
    const shipmentDoc = snapshot.docs[0];
    return await getShipmentById(shipmentDoc.id);
}

export async function getDrivers(): Promise<UserProfile[]> {
    const firestore = await getFirestore();
    const usersCol = collection(firestore, "users");
    const q = query(usersCol, where("role", "==", "driver"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as UserProfile));
}

export async function getDriverShipment(driverId: string): Promise<Shipment | undefined> {
    const firestore = await getFirestore();
    const shipmentsCol = collection(firestore, "shipments");
    const q = query(shipmentsCol, 
        where("assignedDriverId", "==", driverId), 
        where("isCompleted", "==", false)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const shipmentDoc = snapshot.docs[0];
    return await getShipmentById(shipmentDoc.id);
}


// --- Data Mutation Actions ---

export async function createShipmentAction(data: {
  origin: string;
  destination: string;
  driverId: string;
}) {
  const firestore = await getFirestore();
  const driverDocRef = doc(firestore, "users", data.driverId);
  const driverDoc = await getDoc(driverDocRef);
  
  if (!driverDoc.exists()) {
    return { error: "Invalid driver selected." };
  }
  const driver = driverDoc.data() as UserProfile;
  
  const newShipmentRef = doc(collection(firestore, "shipments"));
  const shipmentId = newShipmentRef.id;

  const newShipmentData = {
    id: shipmentId, // Add this
    orderCode: `TT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    assignedDriverId: data.driverId,
    assignedDriverName: driver.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStatus: "pending" as ShipmentStatus,
    statusTimestamps: {},
    isCompleted: false,
    origin: data.origin,
    destination: data.destination,
  };
  
  try {
    await setDoc(newShipmentRef, newShipmentData);
    revalidatePath("/admin/dashboard");
    return { success: true, shipment: newShipmentData };
  } catch (e: any) {
    return { error: `Failed to create shipment: ${e.message}`, details: { path: newShipmentRef.path, operation: 'create', resource: newShipmentData }};
  }
}

export async function updateShipmentStatusAction(shipmentId: string, status: ShipmentStatus, driverId: string) {
    const firestore = await getFirestore();
    const shipmentRef = doc(firestore, "shipments", shipmentId);
    
    const driverDoc = await getDoc(doc(firestore, "users", driverId));
    const driver = driverDoc.data() as UserProfile;
    if (!driver) return { error: "Driver not found" };

    const now = new Date();
    const statusLogRef = doc(collection(firestore, `shipments/${shipmentId}/statusLogs`));
    
    const newLogData = {
        id: statusLogRef.id,
        status: status,
        timestamp: now.toISOString(),
        actorId: driverId,
        actorName: driver.name,
        source: 'driver' as const
    };

    const updateData: any = {
        currentStatus: status,
        [`statusTimestamps.${status}`]: now.toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    if (status === 'trip_completed') {
        updateData.isCompleted = true;
    }

    try {
      const batch = writeBatch(firestore);
      batch.update(shipmentRef, updateData);
      batch.set(statusLogRef, newLogData);
      await batch.commit();

      revalidatePath('/driver/dashboard');
      revalidatePath('/admin/dashboard');
      revalidatePath(`/admin/shipments/${shipmentId}`);
      revalidatePath(`/track?orderCode=*`, 'layout');

      return { success: true };
    } catch (e: any) {
        return { error: `Failed to update shipment: ${e.message}`, details: { path: shipmentRef.path, operation: 'update', resource: updateData } };
    }
}

export async function correctTimestampAction(data: CorrectTimestampInput) {
    const firestore = await getFirestore();
    try {
        const result = await correctTimestampAI(data);
        
        const shipmentRef = doc(firestore, "shipments", data.shipmentId);
        
        // Use a generic admin identity for logging purposes
        const admin = { uid: 'admin_system', name: 'Admin Correction' };

        const newTimestamp = result.suggestedTimestamp;
        const statusToUpdate = data.statusType as ShipmentStatus;

        const newLogRef = doc(collection(firestore, `shipments/${data.shipmentId}/statusLogs`));
        const newLogData = {
            id: newLogRef.id,
            status: statusToUpdate,
            timestamp: newTimestamp,
            actorId: admin.uid,
            actorName: admin.name,
            source: 'admin' as const,
            notes: `Original: ${data.incorrectTimestamp}. AI Reason: ${result.explanation} (Conf: ${result.confidence.toFixed(2)})`
        };

        const updateData = {
            [`statusTimestamps.${statusToUpdate}`]: newTimestamp,
            updatedAt: new Date().toISOString()
        };

        const batch = writeBatch(firestore);
        batch.update(shipmentRef, updateData);
        batch.set(newLogRef, newLogData);
        await batch.commit();
        
        revalidatePath(`/admin/shipments/${data.shipmentId}`);
        revalidatePath('/admin/dashboard');

        return { success: true, aiSuggestion: result };
    } catch (error: any) {
        console.error("AI Timestamp Correction Failed:", error);
        return { error: error.message || "AI timestamp correction failed. Please try again." };
    }
}

    