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

export async function updateDriver(id: string, data: Partial<Omit<Driver, 'id' | 'passwordHash'> & { password?: string }>): Promise<Driver | undefined> {
    const drivers = await readData();
    const driverIndex = drivers.findIndex(driver => driver.id === id);

    if (driverIndex === -1) {
        return undefined;
    }

    const currentDriver = drivers[driverIndex];

    const updatedDriver: Driver = {
        ...currentDriver,
        ...data,
        // Only update password if a new one is provided and is not an empty string
        passwordHash: data.password ? data.password : currentDriver.passwordHash,
    };
    
    drivers[driverIndex] = updatedDriver;
    await writeData(drivers);
    return updatedDriver;
}
