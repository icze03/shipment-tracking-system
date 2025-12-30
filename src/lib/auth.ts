import "server-only";
import type { UserProfile, UserRole } from "./types";
import { getDrivers } from "./data/drivers";

// This is a server-side utility for fetching mock user data.
// It simulates fetching a user based on the selected role.

export async function getMockUser(role: UserRole): Promise<UserProfile> {
  if (role === "admin") {
    return {
      id: "admin01",
      name: "Admin User",
      email: "admin@swifttrack.com",
      role: "admin",
    };
  } else {
    // For a driver, we'll just grab the first driver from our data file.
    // In a real app, this would involve looking up the logged-in user.
    const drivers = await getDrivers();
    const firstDriver = drivers[0];
    if (!firstDriver) {
        // This is a fallback if no drivers exist
        return {
            id: 'driver-fallback',
            name: 'Default Driver',
            email: 'driver@swifttrack.com',
            role: 'driver'
        }
    }
    return {
      id: firstDriver.id,
      name: firstDriver.name,
      email: firstDriver.email,
      role: "driver",
    };
  }
}
