
"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import type { Driver, Shipment, ShipmentStatus, UserProfile, UserRole } from "./types";
import { getDrivers, saveDrivers, getDriverById } from "./data/drivers";
import { getShipments, saveShipments, getShipmentById } from "./data/shipments";
import { getMockUser } from "./auth";
import { correctTimestamp as aiCorrectTimestamp } from "@/ai/flows/admin-assisted-timestamp-correction";
import { getPhilippineTimeISO } from "./utils";

// --- Auth Actions ---
export async function getMockUserAction(role: UserRole): Promise<UserProfile> {
    return getMockUser(role);
}

export async function validateCredentialsAction(username: string, password: string): Promise<{ success: boolean; role?: UserRole; userId?: string; error?: string; }> {
    if (username.toLowerCase() === 'admin' && password === 'password') {
        const adminUser = await getMockUser('admin');
        return { success: true, role: 'admin', userId: adminUser.id };
    }

    const drivers = await getDrivers();
    const driver = drivers.find(d => d.email.toLowerCase() === username.toLowerCase());

    // NOTE: In a real app, you would use a secure password hashing and comparison library like bcrypt.
    // For this prototype, we're doing a simple string comparison, which is NOT secure.
    if (driver && driver.passwordHash === password) {
        if (driver.status !== 'active') {
            return { success: false, error: "Your account is not active. Please contact an admin." };
        }
        return { success: true, role: 'driver', userId: driver.id };
    }

    return { success: false, error: "Invalid username or password." };
}


// --- Driver Actions ---

export async function getDriversAction() {
    return getDrivers();
}

export async function addDriverAction(data: {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  password?: string;
}) {
  try {
    const drivers = await getDrivers();
    
    if (drivers.some(d => d.email.toLowerCase() === data.email.toLowerCase())) {
        return { error: 'A driver with this email already exists.' };
    }

    const newDriver: Driver = {
      id: uuidv4(),
      status: "pending", // New drivers start as pending
      name: data.name,
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      // In a real app, hash the password securely. Storing plain text is insecure.
      passwordHash: data.password || 'password123', // Default password if not provided
    };
    await saveDrivers([newDriver, ...drivers]);
    revalidatePath("/admin/approvals");
    revalidatePath("/login"); // In case they try to log in before approval
    return { success: true, driver: newDriver };
  } catch (e: any) {
    return { error: `Failed to add driver: ${e.message}` };
  }
}

export async function approveDriverAction(driverId: string) {
    try {
        const drivers = await getDrivers();
        const driverIndex = drivers.findIndex(d => d.id === driverId);

        if (driverIndex === -1) {
            return { error: "Driver not found." };
        }

        drivers[driverIndex].status = 'active';
        await saveDrivers(drivers);

        revalidatePath("/admin/approvals");
        revalidatePath("/admin/drivers");

        return { success: true };
    } catch (e: any) {
        return { error: `Failed to approve driver: ${e.message}` };
    }
}

export async function removeDriverAction(driverId: string) {
    try {
        let drivers = await getDrivers();
        const initialCount = drivers.length;
        drivers = drivers.filter(d => d.id !== driverId);

        if (drivers.length === initialCount) {
            return { error: "Driver not found." };
        }

        await saveDrivers(drivers);

        revalidatePath("/admin/approvals");
        revalidatePath("/admin/drivers");
        revalidatePath("/admin/reports");

        return { success: true };
    } catch (e: any) {
        return { error: `Failed to remove driver: ${e.message}` };
    }
}

// --- Shipment Actions ---
export async function getShipmentsAction() {
    return getShipments();
}

export async function createShipmentAction(data: {
  origin: string;
  destination: string;
  description: string;
  driverId: string;
  notes?: string;
}) {
  try {
    const [shipments, driver] = await Promise.all([
      getShipments(),
      getDriverById(data.driverId),
    ]);
    
    if (!driver) {
      return { error: "Invalid driver selected." };
    }
    
    const now = getPhilippineTimeISO();
    const newShipment: Shipment = {
      id: uuidv4(),
      orderCode: `GLT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      assignedDriverId: data.driverId,
      assignedDriverName: driver.name,
      createdAt: now,
      updatedAt: now,
      currentStatus: "pending",
      statusTimestamps: {},
      statusLogs: [],
      isCompleted: false,
      origin: data.origin,
      destination: data.destination,
      description: data.description,
      notes: data.notes,
    };
    
    await saveShipments([newShipment, ...shipments]);

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/shipments");
    revalidatePath("/admin/reports");
    revalidatePath("/driver/dashboard");

    return { success: true, shipment: newShipment };
  } catch (e: any) {
    return { error: `Failed to create shipment: ${e.message}`};
  }
}

export async function updateShipmentStatusAction(data: {
    shipmentId: string;
    status: ShipmentStatus;
    driverId: string;
}) {
    const { shipmentId, status, driverId } = data;
    try {
        const [shipment, driver, shipments] = await Promise.all([
            getShipmentById(shipmentId),
            getMockUser("driver"), // Using mock user as we know this action is by a driver
            getShipments(),
        ]);

        if (!shipment) return { error: "Shipment not found." };
        if (!driver) return { error: "Driver not found." };
        
        const now = getPhilippineTimeISO();

        const newLogEntry = {
            id: uuidv4(),
            status: status,
            timestamp: now,
            actorId: driver.id,
            actorName: driver.name,
            source: 'driver' as const,
            isFlagged: false,
        };

        shipment.currentStatus = status;
        shipment.statusTimestamps[status] = now;
        shipment.updatedAt = now;
        shipment.statusLogs.push(newLogEntry);
        
        if (status === 'trip_completed') {
            shipment.isCompleted = true;
        }
        
        const shipmentIndex = shipments.findIndex(s => s.id === shipmentId);
        if (shipmentIndex > -1) {
            shipments[shipmentIndex] = shipment;
        } else {
            // This case should ideally not happen if data is consistent
            shipments.unshift(shipment);
        }

        await saveShipments(shipments);

        revalidatePath('/driver/dashboard');
        revalidatePath('/admin/dashboard');
        revalidatePath(`/admin/shipments`);
        revalidatePath(`/admin/shipments/${shipmentId}`);
        revalidatePath(`/track?orderCode=${shipment.orderCode}`, 'layout');
        revalidatePath("/admin/reports");

        return { success: true, shipment };
    } catch (e: any) {
        return { error: `Failed to update shipment: ${e.message}` };
    }
}

export async function correctTimestampAction(data: {
    shipmentId: string;
    statusType: ShipmentStatus;
    logIdToCorrect: string;
    notes?: string;
}) {
    const { shipmentId, statusType, logIdToCorrect, notes } = data;

    try {
        const shipments = await getShipments();
        const shipmentIndex = shipments.findIndex(s => s.id === shipmentId);
        if (shipmentIndex === -1) {
            return { error: "Shipment not found" };
        }

        const shipment = shipments[shipmentIndex];
        const logToCorrectIndex = shipment.statusLogs.findIndex(log => log.id === logIdToCorrect);
        if (logToCorrectIndex === -1) {
            return { error: "Original log entry to correct not found." };
        }
        
        const correctedTimestamp = getPhilippineTimeISO(); // Use the current time for the correction.
        
        // Update the main timestamp record for the timeline view
        shipment.statusTimestamps[statusType] = correctedTimestamp;
        shipment.updatedAt = correctedTimestamp;

        // Unflag the original log entry
        shipment.statusLogs[logToCorrectIndex].isFlagged = false;

        const adminUser = await getMockUser("admin");
        
        // Create a new log entry for this administrative action
        const correctionLogEntry = {
            id: uuidv4(),
            status: statusType,
            timestamp: correctedTimestamp, // Log the correction at the time it happened.
            actorId: adminUser.id,
            actorName: adminUser.name,
            source: 'admin' as const,
            isCorrection: true,
            notes: `Admin applied correction. ${notes || ''}`.trim(),
        };
        shipment.statusLogs.push(correctionLogEntry);
        
        // Re-sort logs and determine the new current status based on the latest valid timestamp
        shipment.statusLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const latestStatus = Object.entries(shipment.statusTimestamps)
                                  .sort(([, a], [, b]) => new Date(b!).getTime() - new Date(a!).getTime())[0];
        if (latestStatus) {
            shipment.currentStatus = latestStatus[0] as ShipmentStatus;
        }
        
        shipments[shipmentIndex] = shipment;
        await saveShipments(shipments);
        
        revalidatePath(`/admin/shipments/${shipmentId}`);
        revalidatePath(`/track?orderCode=${shipment.orderCode}`, 'layout');
        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/approvals');

        // Return a confirmation object for the UI
        const aiSuggestion = {
            suggestedTimestamp: correctedTimestamp,
            confidence: 1.0, // Confidence is 100% as it's a direct admin action
            explanation: "Timestamp updated to the time of administrative correction."
        };

        return { success: true, aiSuggestion };

    } catch (e: any) {
        return { error: e.message };
    }
}


export async function requestCorrectionAction(data: {
    shipmentId: string;
    driverId: string;
    statusToCorrect: ShipmentStatus;
    reason: string;
}) {
    const { shipmentId, driverId, statusToCorrect, reason } = data;
    try {
        const [driver, shipments] = await Promise.all([
            getDriverById(driverId),
            getShipments(),
        ]);

        if (!driver) return { error: "Driver not found." };

        const shipmentIndex = shipments.findIndex(s => s.id === shipmentId);
        if (shipmentIndex === -1) return { error: "Shipment not found." };
        
        const shipment = shipments[shipmentIndex];

        // Find the specific log entry to flag, looking for the most recent one matching the status and driver
        const logToFlagIndex = shipment.statusLogs.slice().reverse().findIndex(log => log.status === statusToCorrect && log.actorId === driverId && !log.isCorrection && !log.isFlagged);
        
        if (logToFlagIndex === -1) {
            return { error: "Could not find the original status update to flag for correction. It may have already been flagged or corrected." };
        }
        
        // Get the correct index in the original array
        const originalIndex = shipment.statusLogs.length - 1 - logToFlagIndex;

        // Flag the original entry and add the reason
        shipment.statusLogs[originalIndex].isFlagged = true;
        shipment.statusLogs[originalIndex].correctionReason = reason;

        shipment.updatedAt = getPhilippineTimeISO();
        
        shipments[shipmentIndex] = shipment;
        await saveShipments(shipments);

        // Revalidate paths to ensure data is fresh across the app
        revalidatePath('/driver/dashboard');
        revalidatePath(`/admin/shipments/${shipmentId}`);
        revalidatePath(`/track?orderCode=${shipment.orderCode}`, 'layout');
        revalidatePath('/admin/approvals');

        return { success: true };
    } catch (e: any) {
        return { error: `Failed to submit correction request: ${e.message}` };
    }
}

export async function cancelShipmentAction(
    shipmentId: string, 
    cancellationReason?: string, 
    driverInstructions?: string
) {
    try {
        const shipments = await getShipments();
        const shipmentIndex = shipments.findIndex(s => s.id === shipmentId);

        if (shipmentIndex === -1) {
            return { error: "Shipment not found." };
        }

        const shipment = shipments[shipmentIndex];

        if (shipment.isCompleted || shipment.currentStatus === 'cancelled') {
            return { error: "Shipment is already completed or cancelled." };
        }

        const now = getPhilippineTimeISO();
        const adminUser = await getMockUser("admin");

        shipment.currentStatus = 'cancelled';
        shipment.isCompleted = true; // Treat cancelled as a form of completion
        shipment.updatedAt = now;
        shipment.cancellationReason = cancellationReason;
        shipment.driverInstructions = driverInstructions;

        const cancelLog: typeof shipment.statusLogs[0] = {
            id: uuidv4(),
            status: 'cancelled',
            timestamp: now,
            actorId: adminUser.id,
            actorName: adminUser.name,
            source: 'admin',
            notes: cancellationReason,
        };

        shipment.statusLogs.push(cancelLog);
        shipments[shipmentIndex] = shipment;

        await saveShipments(shipments);

        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/shipments');
        revalidatePath(`/admin/shipments/${shipmentId}`);
        revalidatePath(`/track?orderCode=${shipment.orderCode}`, 'layout');
        revalidatePath("/driver/dashboard");

        return { success: true };
    } catch (e: any) {
        return { error: `Failed to cancel shipment: ${e.message}` };
    }
}

export async function acknowledgeCancellationAction(shipmentId: string, driverId: string) {
    try {
        const [shipments, driver] = await Promise.all([
            getShipments(),
            getDriverById(driverId),
        ]);

        if (!driver) return { error: "Driver not found." };
        
        const shipmentIndex = shipments.findIndex(s => s.id === shipmentId);
        if (shipmentIndex === -1) return { error: "Shipment not found." };
        
        const shipment = shipments[shipmentIndex];
        if (shipment.currentStatus !== 'cancelled') {
            return { error: "Shipment is not cancelled." };
        }

        const now = getPhilippineTimeISO();

        shipment.cancellationAcknowledged = true;
        shipment.updatedAt = now;

        const wasOnTheWay = !!shipment.statusTimestamps.departed_warehouse;
        const note = wasOnTheWay
            ? "Driver confirmed product return after cancellation."
            : "Driver acknowledged cancellation and instructions.";

        const ackLog: typeof shipment.statusLogs[0] = {
            id: uuidv4(),
            status: 'cancellation_acknowledged',
            timestamp: now,
            actorId: driver.id,
            actorName: driver.name,
            source: 'driver',
            notes: note,
        };

        shipment.statusLogs.push(ackLog);
        shipments[shipmentIndex] = shipment;

        await saveShipments(shipments);

        revalidatePath('/driver/dashboard');
        revalidatePath(`/admin/shipments/${shipmentId}`);
        
        return { success: true };
    } catch (e: any) {
        return { error: `Failed to acknowledge cancellation: ${e.message}` };
    }
}
    
export async function clearAllShipmentsAction() {
  try {
    // This action overwrites the shipments data file with an empty array.
    await saveShipments([]);
    
    // Revalidate all paths that show shipment data to reflect the change.
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/shipments");
    revalidatePath("/admin/reports");
    revalidatePath("/driver/dashboard");
    revalidatePath("/track", 'layout');
    
    return { success: true };
  } catch (e: any) {
    return { error: `Failed to clear shipments: ${e.message}` };
  }
}
    

    

