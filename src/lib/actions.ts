
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
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Shipment));
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
    const firestore = await getFirestore();
    const shipmentDoc = doc(firestore, "shipments", id);
    const snapshot = await getDoc(shipmentDoc);
    if (!snapshot.exists()) return undefined;

    // Fetch subcollection
    const statusLogsCol = collection(firestore, `shipments/${id}/statusLogs`);
    const statusLogsSnapshot = await getDocs(statusLogsCol);
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
  const driverDoc = await getDoc(doc(firestore, "users", data.driverId));
  const driver = driverDoc.data() as UserProfile;

  if (!driver) {
    return { error: "Invalid driver selected." };
  }
  
  const shipmentsRef = collection(firestore, "shipments");

  const newShipmentData = {
    orderCode: `TT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    assignedDriverId: data.driverId,
    assignedDriverName: driver.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    currentStatus: "pending",
    statusTimestamps: {},
    isCompleted: false,
    origin: data.origin,
    destination: data.destination,
  };
  
  try {
    const newShipmentRef = await addDoc(shipmentsRef, newShipmentData);
    revalidatePath("/admin/dashboard");
    return { success: true, shipment: { ...newShipmentData, id: newShipmentRef.id } };
  } catch (e: any) {
    // This is now a client component action, so we can't emit from here.
    // The error will be caught client-side now.
    return { error: `Failed to create shipment: ${e.message}`, details: { path: shipmentsRef.path, operation: 'create', resource: newShipmentData }};
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
    
    const newLogData: Omit<StatusLog, 'id'> = {
        status,
        timestamp: now.toISOString(),
        actorId: driverId,
        actorName: driver.name,
        source: 'driver'
    };

    const updateData = {
        currentStatus: status,
        [`statusTimestamps.${status}`]: now.toISOString(),
        updatedAt: serverTimestamp(),
        isCompleted: status === 'trip_completed' ? true : false,
    };

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
        // Since batch errors don't give granular detail, we report what we can.
        // The client-side handler will build the context.
        return { error: `Failed to update shipment: ${e.message}`, details: { path: shipmentRef.path, operation: 'update', resource: updateData } };
    }
}

export async function correctTimestampAction(data: CorrectTimestampInput) {
    const firestore = await getFirestore();
    try {
        const result = await correctTimestampAI(data);
        
        const shipmentRef = doc(firestore, "shipments", data.shipmentId);
        
        // Assuming there is always an admin user with a known ID for logging purposes.
        const admin = { uid: 'admin01', name: 'Admin' };

        const newTimestamp = result.suggestedTimestamp;
        const statusToUpdate = data.statusType as ShipmentStatus;

        const newLogRef = doc(collection(firestore, `shipments/${data.shipmentId}/statusLogs`));
        const newLogData: Omit<StatusLog, 'id'> = {
            status: statusToUpdate,
            timestamp: newTimestamp,
            actorId: admin.uid,
            actorName: admin.name,
            source: 'admin',
            notes: `Original: ${data.incorrectTimestamp}. AI Reason: ${result.explanation} (Conf: ${result.confidence.toFixed(2)})`
        };

        const updateData = {
            [`statusTimestamps.${statusToUpdate}`]: newTimestamp,
            updatedAt: serverTimestamp()
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
