import React from 'react';
import { motion } from 'framer-motion';
import { Ride } from '@shared/schema';
import { formatDate } from '@/lib/trackingUtils';
import { Card } from '@/components/ui/card';

interface RideHistoryCardProps {
  ride: Ride;
  onClick?: () => void;
}

const RideHistoryCard: React.FC<RideHistoryCardProps> = ({ ride, onClick }) => {
  const getDistanceColor = () => {
    if (ride.distance < 20) {
      return "text-electric-purple";
    } else if (ride.distance < 30) {
      return "text-neon-magenta";
    } else {
      return "text-neon-cyan";
    }
  };

  const getDistanceBackgroundColor = () => {
    if (ride.distance < 20) {
      return "bg-electric-purple/10";
    } else if (ride.distance < 30) {
      return "bg-neon-magenta/10";
    } else {
      return "bg-neon-cyan/10";
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0h 0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <motion.div 
      className="depth-card bg-dark-surface rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(13, 240, 255, 0.3)"
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background pattern for the image placeholder */}
      <div className="w-full h-32 bg-gradient-to-r from-dark-bg via-dark-surface to-dark-bg shimmer">
        {/* Add an abstract pattern */}
        <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <path
            d="M0,50 Q25,25 50,50 T100,50 T150,50"
            fill="none"
            stroke="rgba(13, 240, 255, 0.2)"
            strokeWidth="0.5"
          />
          <path
            d="M0,60 Q25,35 50,60 T100,60 T150,60"
            fill="none"
            stroke="rgba(255, 0, 255, 0.2)"
            strokeWidth="0.5"
          />
          <path
            d="M0,70 Q25,45 50,70 T100,70 T150,70"
            fill="none"
            stroke="rgba(157, 0, 255, 0.2)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-rajdhani font-semibold">{ride.title}</h3>
            <p className="text-gray-400 text-sm">{formatDate(new Date(ride.startTime))}</p>
          </div>
          <div className={`rounded-full px-2 py-1 ${getDistanceBackgroundColor()}`}>
            <span className={`text-xs font-medium ${getDistanceColor()}`}>
              {ride.distance?.toFixed(1) || 0} km
            </span>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-gray-400">Time</p>
            <p className="font-rajdhani">{formatDuration(ride.duration || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Avg Speed</p>
            <p className="font-rajdhani">{ride.avgSpeed?.toFixed(1) || 0} km/h</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Elevation</p>
            <p className="font-rajdhani">{ride.elevation || 0} m</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RideHistoryCard;
