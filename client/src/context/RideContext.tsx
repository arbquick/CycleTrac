import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { CurrentRideData, GPSPoint, RouteData, InsertRide } from '@shared/schema';
import { useGPS } from '@/hooks/useGPS';
import { 
  calculateDistance, 
  calculateSpeed, 
  calculateElevationGain, 
  simulateCadence, 
  calculateRideStats, 
  formatDuration 
} from '@/lib/trackingUtils';
import { 
  saveCurrentRide, 
  loadCurrentRide, 
  clearCurrentRide, 
  saveRideLocally, 
  syncLocalRides, 
  setupSyncListener, 
  initializeDemoUser, 
  getCurrentUser 
} from '@/lib/storageUtils';

// Default initial ride data
const initialRideData: CurrentRideData = {
  isActive: false,
  isPaused: false,
  startTime: new Date(),
  currentTime: new Date(),
  elapsedTime: 0,
  pausedTime: 0,
  distance: 0,
  currentSpeed: 0,
  avgSpeed: 0,
  maxSpeed: 0,
  currentCadence: 0,
  avgCadence: 0,
  maxCadence: 0,
  elevation: 0,
  elevationGain: 0,
  routePoints: []
};

// Context type definition
interface RideContextType {
  currentRide: CurrentRideData & Record<string, string | number>;
  syncStatus: 'online' | 'offline';
  startRide: (title: string) => void;
  pauseRide: () => void;
  resumeRide: () => void;
  endRide: () => void;
  toggleSync: () => void;
}

export const RideContext = createContext<RideContextType>({
  currentRide: { ...initialRideData, ...calculateRideStats(initialRideData) },
  syncStatus: 'offline',
  startRide: () => {},
  pauseRide: () => {},
  resumeRide: () => {},
  endRide: () => {},
  toggleSync: () => {}
});

interface RideProviderProps {
  children: ReactNode;
}

export const RideProvider: React.FC<RideProviderProps> = ({ children }) => {
  // Main ride state
  const [rideData, setRideData] = useState<CurrentRideData>(initialRideData);
  
  // Sync status
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline'>('offline');
  
  // Ride title
  const [rideTitle, setRideTitle] = useState<string>('');
  
  // GPS tracking
  const { 
    startTracking, 
    stopTracking, 
    location, 
    altitude, 
    accuracy 
  } = useGPS();
  
  // Timer interval
  const timerRef = useRef<number | null>(null);
  
  // Pause timestamp
  const pauseTimeRef = useRef<number | null>(null);
  
  // Load saved ride data on mount
  useEffect(() => {
    // Initialize demo user if needed
    initializeDemoUser();
    
    // Try to load a previously active ride from localStorage
    const savedRide = loadCurrentRide();
    if (savedRide && savedRide.isActive) {
      setRideData(savedRide);
      
      // If ride was active and not paused, resume tracking
      if (!savedRide.isPaused) {
        startTracking();
        startTimer();
      }
    }
    
    // Set up the sync listener
    const cleanupSyncListener = setupSyncListener(() => {
      if (syncStatus === 'online') {
        // Handle successful sync
      }
    });
    
    // Set initial sync status based on network status
    setSyncStatus(navigator.onLine ? 'online' : 'offline');
    
    // Set up event listeners for online/offline status
    const handleOnline = () => setSyncStatus('online');
    const handleOffline = () => setSyncStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      stopTimer();
      stopTracking();
      cleanupSyncListener();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Save ride data to localStorage whenever it changes
  useEffect(() => {
    if (rideData.isActive) {
      saveCurrentRide(rideData);
    }
  }, [rideData]);
  
  // Process GPS updates
  useEffect(() => {
    if (!rideData.isActive || rideData.isPaused || !location) return;
    
    const { latitude, longitude, timestamp } = location;
    
    // Create a new GPS point
    const newPoint: GPSPoint = {
      lat: latitude,
      lng: longitude,
      elevation: altitude || 0,
      timestamp: timestamp,
      speed: location.speed || 0,
      cadence: 0 // Will be simulated later
    };
    
    setRideData(prev => {
      const routePoints = [...prev.routePoints, newPoint];
      
      // Calculate new metrics
      let newDistance = prev.distance;
      let newCurrentSpeed = prev.currentSpeed;
      let newMaxSpeed = prev.maxSpeed;
      let newAvgSpeed = prev.avgSpeed;
      let newElevation = altitude || 0;
      let newElevationGain = prev.elevationGain;
      let newCurrentCadence = prev.currentCadence;
      let newMaxCadence = prev.maxCadence;
      let newAvgCadence = prev.avgCadence;
      
      // Calculate distance if we have at least 2 points
      if (routePoints.length >= 2) {
        const lastPoint = routePoints[routePoints.length - 2];
        const distanceDelta = calculateDistance(lastPoint, newPoint);
        
        // Only add distance if it's reasonable (prevents GPS jumps)
        if (distanceDelta < 0.1) { // Less than 100m
          newDistance += distanceDelta;
        }
        
        // Calculate current speed
        newCurrentSpeed = location.speed 
          ? location.speed * 3.6 // Convert m/s to km/h
          : calculateSpeed(distanceDelta, (newPoint.timestamp - lastPoint.timestamp) / 1000);
          
        // Update max speed
        if (newCurrentSpeed > newMaxSpeed) {
          newMaxSpeed = newCurrentSpeed;
        }
        
        // Calculate average speed
        newAvgSpeed = newDistance / (prev.elapsedTime / 3600);
        
        // Simulate cadence based on speed
        newCurrentCadence = simulateCadence(newCurrentSpeed);
        
        // Update max cadence
        if (newCurrentCadence > newMaxCadence) {
          newMaxCadence = newCurrentCadence;
        }
        
        // Calculate average cadence
        const totalCadence = prev.avgCadence * (routePoints.length - 1) + newCurrentCadence;
        newAvgCadence = totalCadence / routePoints.length;
        
        // Calculate elevation gain if altitude data is available
        if (lastPoint.elevation !== undefined && newPoint.elevation !== undefined) {
          const elevationDelta = newPoint.elevation - lastPoint.elevation;
          if (elevationDelta > 0) {
            newElevationGain += elevationDelta;
          }
        }
      }
      
      return {
        ...prev,
        routePoints,
        distance: newDistance,
        currentSpeed: newCurrentSpeed,
        maxSpeed: newMaxSpeed,
        avgSpeed: newAvgSpeed,
        elevation: newElevation,
        elevationGain: newElevationGain,
        currentCadence: newCurrentCadence,
        maxCadence: newMaxCadence,
        avgCadence: newAvgCadence
      };
    });
  }, [location, rideData.isActive, rideData.isPaused]);
  
  // Timer functions
  const startTimer = () => {
    if (timerRef.current) return;
    
    timerRef.current = window.setInterval(() => {
      setRideData(prev => {
        const now = new Date();
        const newElapsedTime = prev.elapsedTime + 1; // Add one second
        
        return {
          ...prev,
          currentTime: now,
          elapsedTime: newElapsedTime
        };
      });
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Ride control functions
  const startRide = (title: string) => {
    setRideTitle(title);
    const startTime = new Date();
    
    setRideData({
      isActive: true,
      isPaused: false,
      startTime,
      currentTime: startTime,
      elapsedTime: 0,
      pausedTime: 0,
      distance: 0,
      currentSpeed: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      currentCadence: 0,
      avgCadence: 0,
      maxCadence: 0,
      elevation: 0,
      elevationGain: 0,
      routePoints: []
    });
    
    startTracking();
    startTimer();
  };
  
  const pauseRide = () => {
    stopTimer();
    pauseTimeRef.current = Date.now();
    stopTracking();
    
    setRideData(prev => ({
      ...prev,
      isPaused: true
    }));
  };
  
  const resumeRide = () => {
    const pauseDuration = pauseTimeRef.current ? (Date.now() - pauseTimeRef.current) / 1000 : 0;
    pauseTimeRef.current = null;
    
    setRideData(prev => ({
      ...prev,
      isPaused: false,
      pausedTime: prev.pausedTime + pauseDuration
    }));
    
    startTracking();
    startTimer();
  };
  
  const endRide = async () => {
    // Stop tracking and timing
    stopTimer();
    stopTracking();
    
    // Prepare ride data for storage
    const endTime = new Date();
    const duration = rideData.elapsedTime;
    
    // Create route data
    const routeData: RouteData = {
      points: rideData.routePoints,
      stats: {
        topSpeed: rideData.maxSpeed,
        avgCadence: rideData.avgCadence,
        maxCadence: rideData.maxCadence,
        totalElevationGain: rideData.elevationGain
      }
    };
    
    // Get current user
    const currentUser = getCurrentUser();
    
    if (rideData.routePoints.length > 0) {
      // Create ride object for storage
      const newRide: InsertRide = {
        userId: currentUser?.id || -1,
        title: rideTitle || 'Untitled Ride',
        startTime: rideData.startTime,
        endTime,
        duration,
        distance: rideData.distance,
        avgSpeed: rideData.avgSpeed,
        maxSpeed: rideData.maxSpeed,
        elevation: Math.round(rideData.elevationGain),
        routeData,
        isUploaded: false
      };
      
      // Save to local storage
      await saveRideLocally(newRide);
      
      // Try to sync if online
      if (syncStatus === 'online') {
        try {
          await syncLocalRides();
        } catch (error) {
          console.error("Failed to sync ride:", error);
        }
      }
    }
    
    // Clear current ride data
    clearCurrentRide();
    
    // Reset state
    setRideData(initialRideData);
    setRideTitle('');
  };
  
  // Toggle sync status (manual override)
  const toggleSync = () => {
    const newStatus = syncStatus === 'online' ? 'offline' : 'online';
    setSyncStatus(newStatus);
    
    if (newStatus === 'online') {
      syncLocalRides().catch(error => {
        console.error("Failed to sync rides:", error);
      });
    }
  };
  
  // Calculate UI stats for display
  const rideStats = calculateRideStats(rideData);
  
  // Combine tracking data with calculated stats
  const currentRide = {
    ...rideData,
    ...rideStats
  };
  
  return (
    <RideContext.Provider
      value={{
        currentRide,
        syncStatus,
        startRide,
        pauseRide,
        resumeRide,
        endRide,
        toggleSync
      }}
    >
      {children}
    </RideContext.Provider>
  );
};
