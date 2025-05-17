import React from 'react';
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import { Button } from '@/components/ui/button';
import { useRide } from '@/hooks/useRideData';

const CurrentRideCard: React.FC = () => {
  const { currentRide, pauseRide, resumeRide, endRide } = useRide();

  if (!currentRide.isActive) {
    return null;
  }

  const handlePauseResume = () => {
    if (currentRide.isPaused) {
      resumeRide();
    } else {
      pauseRide();
    }
  };

  return (
    <motion.div 
      className="relative bg-dark-surface rounded-xl border-gradient p-5 shadow-lg perspective-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -top-3 right-4 bg-neon-cyan text-black font-bold text-xs px-3 py-1 rounded-full">
        {currentRide.isPaused ? "PAUSED" : "LIVE"}
      </div>
      <h2 className="font-rajdhani font-bold text-2xl mb-4">Current Ride</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Time" 
          value={currentRide.duration} 
          color="cyan" 
        />
        <StatsCard 
          title="Distance" 
          value={`${currentRide.distance} `} 
          unit="km" 
          color="magenta" 
        />
        <StatsCard 
          title="Avg Speed" 
          value={`${currentRide.avgSpeed} `} 
          unit="km/h" 
          color="purple" 
        />
        <StatsCard 
          title="Elevation" 
          value={`${currentRide.elevation} `} 
          unit="m" 
          color="cyan" 
        />
      </div>
      
      <div className="mt-6 flex justify-around">
        <Button
          onClick={handlePauseResume}
          className={`group ${
            currentRide.isPaused 
              ? "bg-neon-cyan hover:bg-neon-cyan/90 text-black" 
              : "bg-neon-magenta hover:bg-neon-magenta/90 text-black"
          } font-bold py-3 px-8 rounded-full transition-all ${
            !currentRide.isPaused && "animate-pulse-cyan"
          }`}
        >
          <span className="flex items-center">
            <span className="material-icons mr-2">
              {currentRide.isPaused ? "play_arrow" : "pause"}
            </span>
            {currentRide.isPaused ? "RESUME" : "PAUSE"}
          </span>
        </Button>
        <Button
          onClick={endRide}
          className="group bg-dark-bg border border-neon-cyan/50 hover:border-neon-cyan text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          <span className="flex items-center">
            <span className="material-icons mr-2">stop</span>
            END RIDE
          </span>
        </Button>
      </div>
    </motion.div>
  );
};

export default CurrentRideCard;
