
"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import type { Driver, Shipment, ShipmentStatus, UserProfile, UserRole } from "./types";
import { getDrivers, saveDrivers, getDriverById } from "./data/drivers";
import { getShipments, saveShipments, getShipmentById } from "./data/shipments";
import { getMockUser } from "./auth";

// --- Auth Actions ---
export async function getMockUserAction(role: UserRole): Promise<UserProfile> {
    return getMockUser(role);
}

export async function validateCredentialsAction(username: string, password: string): Promise<{ success: boolean; role?: UserRole; userId?: string; error?: string; }> {
    if (username.toLowerCase() === 'astraea millares' && password === 'astraea1234') {
        const adminUser = await getMockUser('admin');
        return { success: true, role: 'admin', userId: adminUser.id };
    }

    const drivers = await getDrivers();
    const driver = drivers.find(d => d.email.toLowerCase() === username.toLowerCase());

    // NOTE: In a real app, you would use a secure password hashing and comparison library like bcrypt.
    // For this prototype, we're doing a simple string comparison, which is NOT secure.
    if (driver && driver.passwordHash === password) {
        return { success: true, role: 'driver', userId: driver.id };
    }

    return { success: false, error: "Invalid username or password." };
}


// --- Driver Actions ---

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
      status: "active",
      name: data.name,
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      // In a real app, hash the password securely. Storing plain text is insecure.
      passwordHash: data.password || 'password', // Default password if not provided
    };
    await saveDrivers([newDriver, ...drivers]);
    revalidatePath("/admin/drivers");
    return { success: true, driver: newDriver };
  } catch (e: any) {
    return { error: `Failed to add driver: ${e.message}` };
  }
}

// --- Shipment Actions ---

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
    
    const newShipment: Shipment = {
      id: uuidv4(),
      orderCode: `SWT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      assignedDriverId: data.driverId,
      assignedDriverName: driver.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
        
        const now = new Date().toISOString();

        const newLogEntry = {
            id: uuidv4(),
            status: status,
            timestamp: now,
            actorId: driver.id,
            actorName: driver.name,
            source: 'driver' as const
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

        return { success: true, shipment };
    } catch (e: any) {
        return { error: `Failed to update shipment: ${e.message}` };
    }
}
