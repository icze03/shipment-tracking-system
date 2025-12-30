import 'server-only'
import { promises as fs } from 'fs';
import path from 'path';
import type { Driver } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'src/lib/data/drivers.json');

async function readData(): Promise<Driver[]> {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(fileContent) as Driver[];
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array
        return [];
    }
}

async function writeData(data: Driver[]): Promise<void> {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getDrivers(): Promise<Driver[]> {
    const drivers = await readData();
    return drivers.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDriverById(id: string): Promise<Driver | undefined> {
    const drivers = await readData();
    return drivers.find(driver => driver.id === id);
}

export async function saveDrivers(drivers: Driver[]): Promise<void> {
    await writeData(drivers);
}
