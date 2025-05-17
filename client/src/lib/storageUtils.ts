import { Ride, InsertRide, GPSPoint, RouteData, CurrentRideData } from '@shared/schema';
import { apiRequest } from './queryClient';
import { queryClient } from './queryClient';

const RIDES_STORAGE_KEY = 'cycletrac_rides';
const CURRENT_RIDE_KEY = 'cycletrac_current_ride';
const CURRENT_USER_KEY = 'cycletrac_current_user';

// Save current ride data to localStorage (used during active tracking)
export async function saveCurrentRide(rideData: CurrentRideData): Promise<void> {
  try {
    localStorage.setItem(CURRENT_RIDE_KEY, JSON.stringify(rideData));
  } catch (error) {
    console.error("Failed to save current ride data:", error);
    throw new Error("Failed to save ride data locally");
  }
}

// Load current ride data from localStorage
export function loadCurrentRide(): CurrentRideData | null {
  try {
    const data = localStorage.getItem(CURRENT_RIDE_KEY);
    if (!data) return null;
    
    const parsedData = JSON.parse(data) as CurrentRideData;
    
    // Convert date strings back to Date objects
    if (typeof parsedData.startTime === 'string') {
      parsedData.startTime = new Date(parsedData.startTime);
    }
    if (typeof parsedData.currentTime === 'string') {
      parsedData.currentTime = new Date(parsedData.currentTime);
    }
    
    return parsedData;
  } catch (error) {
    console.error("Failed to load current ride data:", error);
    return null;
  }
}

// Clear current ride data
export function clearCurrentRide(): void {
  localStorage.removeItem(CURRENT_RIDE_KEY);
}

// Save completed ride to local storage
export async function saveRideLocally(ride: InsertRide): Promise<Ride> {
  try {
    // Get existing rides
    const existingRidesJson = localStorage.getItem(RIDES_STORAGE_KEY);
    const existingRides: Ride[] = existingRidesJson ? JSON.parse(existingRidesJson) : [];
    
    // Generate a local ID (negative to avoid conflicts with server IDs)
    const localId = -(Date.now());
    
    // Create a new ride with the local ID
    const newRide: Ride = {
      ...ride,
      id: localId,
      isUploaded: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to the existing rides
    existingRides.push(newRide);
    
    // Save back to localStorage
    localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(existingRides));
    
    return newRide;
  } catch (error) {
    console.error("Failed to save ride locally:", error);
    throw new Error("Failed to save ride data locally");
  }
}

// Get all locally stored rides
export function getLocalRides(): Ride[] {
  try {
    const ridesJson = localStorage.getItem(RIDES_STORAGE_KEY);
    if (!ridesJson) return [];
    
    const rides = JSON.parse(ridesJson) as Ride[];
    
    // Convert string dates to Date objects
    return rides.map(ride => ({
      ...ride,
      startTime: new Date(ride.startTime),
      endTime: ride.endTime ? new Date(ride.endTime) : undefined,
      createdAt: new Date(ride.createdAt),
      updatedAt: new Date(ride.updatedAt)
    }));
  } catch (error) {
    console.error("Failed to load local rides:", error);
    return [];
  }
}

// Sync local rides to server when online
export async function syncLocalRides(): Promise<void> {
  try {
    // Check if online
    if (!navigator.onLine) {
      throw new Error("No internet connection available");
    }
    
    // Get locally stored rides that haven't been uploaded
    const localRides = getLocalRides();
    const unsyncedRides = localRides.filter(ride => !ride.isUploaded);
    
    if (unsyncedRides.length === 0) {
      return;
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error("No user logged in");
    }
    
    // Sync each unsynced ride
    const syncPromises = unsyncedRides.map(async (ride) => {
      try {
        // Prepare ride data for server (remove local ID)
        const { id, isUploaded, createdAt, updatedAt, ...rideData } = ride;
        const insertData: InsertRide = {
          ...rideData,
          userId: currentUser.id
        };
        
        // Send to server
        const response = await apiRequest('POST', '/api/rides', insertData);
        const syncedRide = await response.json();
        
        // Update local copy with server ID and mark as uploaded
        updateLocalRide(id, {
          ...ride,
          id: syncedRide.id,
          isUploaded: true,
          updatedAt: new Date()
        });
        
        return syncedRide;
      } catch (error) {
        console.error(`Failed to sync ride ${ride.id}:`, error);
        return null;
      }
    });
    
    await Promise.all(syncPromises);
    
    // Refresh rides cache
    queryClient.invalidateQueries({ queryKey: ['/api/rides'] });
  } catch (error) {
    console.error("Failed to sync rides:", error);
    throw error;
  }
}

// Update a local ride
function updateLocalRide(id: number, updatedRide: Ride): void {
  try {
    const rides = getLocalRides();
    const rideIndex = rides.findIndex(r => r.id === id);
    
    if (rideIndex !== -1) {
      rides[rideIndex] = updatedRide;
      localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(rides));
    }
  } catch (error) {
    console.error("Failed to update local ride:", error);
  }
}

// Get user from local storage
export function getCurrentUser(): { id: number; username: string } | null {
  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Failed to load user data:", error);
    return null;
  }
}

// Save user to local storage
export function saveCurrentUser(user: { id: number; username: string }): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Clear user from local storage
export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Initialize demo user if needed
export function initializeDemoUser(): void {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    // Create a demo user for testing purposes
    saveCurrentUser({
      id: -1, // Negative ID indicates local-only user
      username: "demo_user"
    });
  }
}

// Delete a ride
export async function deleteRide(id: number): Promise<boolean> {
  try {
    // Get locally stored rides
    const localRides = getLocalRides();
    const updatedRides = localRides.filter(ride => ride.id !== id);
    
    // Save back to localStorage
    localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
    
    // If it's a server-side ride and we're online, delete from server
    if (id > 0 && navigator.onLine) {
      try {
        await apiRequest('DELETE', `/api/rides/${id}`);
      } catch (error) {
        console.error("Failed to delete ride from server:", error);
        // Continue anyway - we've already deleted it locally
      }
    }
    
    // Refresh rides cache
    queryClient.invalidateQueries({ queryKey: ['/api/rides'] });
    
    return true;
  } catch (error) {
    console.error("Failed to delete ride:", error);
    return false;
  }
}

// Listen for online status changes to trigger sync
export function setupSyncListener(onSync: () => void): () => void {
  const handleOnline = async () => {
    try {
      await syncLocalRides();
      onSync();
    } catch (error) {
      console.error("Auto-sync failed:", error);
    }
  };
  
  window.addEventListener('online', handleOnline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
