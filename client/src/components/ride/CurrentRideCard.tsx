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
              ? "bg-gradient-to-r from-gold-accent to-neon-cyan hover:shadow-lg hover:shadow-gold-accent/20 text-black" 
              : "bg-gradient-to-r from-neon-magenta to-electric-purple hover:shadow-lg hover:shadow-neon-magenta/20 text-black"
          } font-bold py-3 px-8 rounded-full transition-all duration-300 ${
            !currentRide.isPaused && "animate-pulse-gold"
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
          className="group bg-dark-bg border border-gold-accent/30 hover:border-gold-accent/60 hover:bg-dark-surface text-white font-bold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-md"
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
