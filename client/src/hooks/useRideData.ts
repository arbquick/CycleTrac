import { useContext, useCallback } from 'react';
import { RideContext } from '@/context/RideContext';
import { CurrentRideData } from '@shared/schema';

interface UseRideResult {
  currentRide: CurrentRideData & Record<string, string | number>;
  syncStatus: 'online' | 'offline';
  isRideActive: boolean;
  isRidePaused: boolean;
  startRide: (title: string) => void;
  pauseRide: () => void;
  resumeRide: () => void;
  endRide: () => void;
  toggleSync: () => void;
}

/**
 * Custom hook for accessing and controlling ride data
 * 
 * Provides methods for starting, pausing, resuming and ending rides,
 * as well as accessing current ride data and sync status.
 */
export const useRide = (): UseRideResult => {
  const { 
    currentRide, 
    syncStatus,
    startRide: contextStartRide,
    pauseRide: contextPauseRide,
    resumeRide: contextResumeRide,
    endRide: contextEndRide,
    toggleSync: contextToggleSync
  } = useContext(RideContext);
  
  const isRideActive = currentRide.isActive;
  const isRidePaused = currentRide.isPaused;
  
  // Wrapper functions to ensure consistent behavior
  const startRide = useCallback((title: string) => {
    if (!isRideActive) {
      contextStartRide(title);
    } else {
      console.warn("Cannot start a new ride while one is already active");
    }
  }, [isRideActive, contextStartRide]);
  
  const pauseRide = useCallback(() => {
    if (isRideActive && !isRidePaused) {
      contextPauseRide();
    } else if (!isRideActive) {
      console.warn("Cannot pause a ride that hasn't started");
    } else {
      console.warn("Ride is already paused");
    }
  }, [isRideActive, isRidePaused, contextPauseRide]);
  
  const resumeRide = useCallback(() => {
    if (isRideActive && isRidePaused) {
      contextResumeRide();
    } else if (!isRideActive) {
      console.warn("Cannot resume a ride that hasn't started");
    } else {
      console.warn("Ride is not paused");
    }
  }, [isRideActive, isRidePaused, contextResumeRide]);
  
  const endRide = useCallback(() => {
    if (isRideActive) {
      contextEndRide();
    } else {
      console.warn("Cannot end a ride that hasn't started");
    }
  }, [isRideActive, contextEndRide]);
  
  // Return the hook API
  return {
    currentRide,
    syncStatus,
    isRideActive,
    isRidePaused,
    startRide,
    pauseRide,
    resumeRide,
    endRide,
    toggleSync: contextToggleSync
  };
};
