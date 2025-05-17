import { useState, useEffect, useRef } from 'react';

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface UseGPSResult {
  location: GPSLocation | null;
  altitude: number | null;
  accuracy: number | null;
  error: string | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export const useGPS = (): UseGPSResult => {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  
  // Reference to the watchPosition ID for cleanup
  const watchIdRef = useRef<number | null>(null);
  
  // Function to start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    // Clear previous tracking if any
    if (watchIdRef.current !== null) {
      stopTracking();
    }
    
    // Set tracking options
    const options: PositionOptions = {
      enableHighAccuracy: true,  // Request high accuracy GPS data
      timeout: 10000,            // 10 seconds timeout
      maximumAge: 0              // Don't use cached position
    };
    
    try {
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        // Success callback
        (position: GeolocationPosition) => {
          const { coords, timestamp } = position;
          
          setLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
            timestamp
          });
          
          setAltitude(coords.altitude);
          setAccuracy(coords.accuracy);
          setError(null);
          setIsTracking(true);
        },
        // Error callback
        (error: GeolocationPositionError) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError('User denied the request for Geolocation');
              break;
            case error.POSITION_UNAVAILABLE:
              setError('Location information is unavailable');
              break;
            case error.TIMEOUT:
              setError('The request to get user location timed out');
              break;
            default:
              setError('An unknown error occurred');
              break;
          }
          setIsTracking(false);
        },
        options
      );
    } catch (e) {
      setError(`Failed to start GPS tracking: ${e instanceof Error ? e.message : String(e)}`);
      setIsTracking(false);
    }
  };
  
  // Function to stop GPS tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
    }
  };
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);
  
  return {
    location,
    altitude,
    accuracy,
    error,
    isTracking,
    startTracking,
    stopTracking
  };
};
