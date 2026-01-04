import 'server-only'
import { promises as fs } from 'fs';
import path from 'path';
import type { Shipment } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'src/lib/data/shipments.json');

async function readData(): Promise<Shipment[]> {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(fileContent) as Shipment[];
    } catch (error) {
        return [];
    }
}

async function writeData(data: Shipment[]): Promise<void> {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getShipments(): Promise<Shipment[]> {
    const shipments = await readData();
    // Sort by most recently updated
    return shipments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
    const shipments = await readData();
    return shipments.find(s => s.id === id);
}

export async function getShipmentByOrderCode(orderCode: string): Promise<Shipment | undefined> {
    const shipments = await readData();
    return shipments.find(s => s.orderCode.toLowerCase() === orderCode.toLowerCase());
}

export async function getDriverShipment(driverId: string, includeCancelled: boolean = false): Promise<Shipment | undefined> {
    const shipments = await readData();
    // Sort by creation date descending to get the most recent one first.
    const sortedShipments = shipments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (includeCancelled) {
        // Find the most recent shipment that is either active or was just cancelled.
        return sortedShipments.find(s => s.assignedDriverId === driverId && (!s.isCompleted || s.currentStatus === 'cancelled'));
    }
    
    // Original logic: find the most recent active shipment.
    return sortedShipments.find(s => s.assignedDriverId === driverId && !s.isCompleted);
}

export async function saveShipments(shipments: Shipment[]): Promise<void> {
    await writeData(shipments);
}
