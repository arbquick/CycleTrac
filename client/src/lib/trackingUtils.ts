import { GPSPoint, CurrentRideData } from '@shared/schema';

// Calculate distance between two GPS points using Haversine formula
export function calculateDistance(point1: GPSPoint, point2: GPSPoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.lat - point1.lat);
  const dLon = toRadians(point2.lng - point1.lng);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate speed from distance and time
export function calculateSpeed(distance: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  // Convert to kilometers per hour
  return (distance / (timeInSeconds / 3600));
}

// Calculate elevation gain between points
export function calculateElevationGain(points: GPSPoint[]): number {
  if (points.length < 2) return 0;
  
  let totalGain = 0;
  
  for (let i = 1; i < points.length; i++) {
    const prevElevation = points[i-1].elevation || 0;
    const currentElevation = points[i].elevation || 0;
    const diff = currentElevation - prevElevation;
    
    // Only count positive elevation changes (uphill)
    if (diff > 0) {
      totalGain += diff;
    }
  }
  
  return totalGain;
}

// Simulate cadence (pedaling rate)
export function simulateCadence(speed: number): number {
  // Rough approximation: higher speed = higher cadence
  // In reality, this depends on gear ratio, but this is a simple MVP simulation
  if (speed < 5) return 0; // Not moving or very slow
  
  // Base cadence around 60 RPM, varying with speed
  const baseCadence = 60;
  const variation = Math.min(40, speed * 2); // Cap at 40 RPM variation
  
  // Add some randomness for realism
  const randomness = Math.random() * 10 - 5; // -5 to +5 RPM
  
  return Math.max(0, Math.round(baseCadence + variation + randomness));
}

// Format seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }
  
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

// Format a timestamp to a readable date string
export function formatDate(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(date, now)) {
    return `Today, ${formatTime(date)}`;
  } else if (isSameDay(date, yesterday)) {
    return `Yesterday, ${formatTime(date)}`;
  } else {
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${formatTime(date)}`;
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Calculate ride statistics
export function calculateRideStats(rideData: CurrentRideData): Record<string, number | string> {
  return {
    duration: formatDuration(rideData.elapsedTime),
    distance: rideData.distance.toFixed(1),
    avgSpeed: rideData.avgSpeed.toFixed(1),
    maxSpeed: rideData.maxSpeed.toFixed(1),
    currentSpeed: rideData.currentSpeed.toFixed(1),
    elevation: Math.round(rideData.elevationGain),
    currentElevation: Math.round(rideData.elevation),
    currentCadence: Math.round(rideData.currentCadence),
    avgCadence: Math.round(rideData.avgCadence),
  };
}
