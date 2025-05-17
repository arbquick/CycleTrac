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
    const distance = ride.distance || 0;
    if (distance < 20) {
      return "text-electric-purple";
    } else if (distance < 30) {
      return "text-neon-magenta";
    } else {
      return "text-gold-accent";
    }
  };

  const getDistanceBackgroundColor = () => {
    const distance = ride.distance || 0;
    if (distance < 20) {
      return "bg-electric-purple/10 border border-electric-purple/20";
    } else if (distance < 30) {
      return "bg-neon-magenta/10 border border-neon-magenta/20";
    } else {
      return "bg-gold-accent/10 border border-gold-accent/20";
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
      className="depth-card bg-dark-surface rounded-xl overflow-hidden hover:shadow-premium transition-all duration-300 cursor-pointer border border-gold-accent/5 wealth-bg"
      whileHover={{ 
        y: -5,
        boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 204, 0, 0.15)"
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
    >
      {/* Premium background pattern */}
      <div className="w-full h-36 bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg shimmer relative overflow-hidden">
        {/* Elegant abstract pattern */}
        <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 215, 0, 0.1)" />
              <stop offset="50%" stopColor="rgba(255, 204, 0, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 215, 0, 0.1)" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 Q25,25 50,50 T100,50 T150,50"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.8"
          />
          <path
            d="M0,60 Q25,35 50,60 T100,60 T150,60"
            fill="none"
            stroke="rgba(13, 240, 255, 0.15)"
            strokeWidth="0.6"
          />
          <path
            d="M0,70 Q25,45 50,70 T100,70 T150,70"
            fill="none"
            stroke="rgba(255, 0, 255, 0.1)"
            strokeWidth="0.6"
          />
        </svg>
        
        {/* Ride's route thumbnail preview - stylized abstract representation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <svg width="60%" height="60%" viewBox="0 0 100 60" fill="none">
            <path 
              d="M10,50 C20,40 30,20 50,25 C70,30 75,10 90,15" 
              stroke="rgba(255, 204, 0, 0.5)" 
              strokeWidth="2"
              strokeLinecap="round"
              className="route-path"
            />
          </svg>
        </div>
      </div>
      
      <div className="px-5 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-rajdhani font-semibold text-lg relative gold-highlight inline-block">{ride.title}</h3>
            <p className="text-gray-400 text-sm flex items-center mt-1">
              <span className="material-icons text-gold-accent/70 text-sm mr-1">event</span>
              {formatDate(new Date(ride.startTime))}
            </p>
          </div>
          <div className={`rounded-full px-3 py-1 ${getDistanceBackgroundColor()}`}>
            <span className={`text-xs font-bold ${getDistanceColor()} flex items-center`}>
              <span className="material-icons text-xs mr-1">straighten</span>
              {ride.distance?.toFixed(1) || 0} km
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-dark-bg/50 rounded-lg p-2 backdrop-blur-sm border border-gold-accent/5">
            <p className="text-xs text-gray-400 flex items-center">
              <span className="material-icons text-xs mr-1 text-neon-cyan/70">timer</span>
              Time
            </p>
            <p className="font-rajdhani font-medium">{formatDuration(ride.duration || 0)}</p>
          </div>
          <div className="bg-dark-bg/50 rounded-lg p-2 backdrop-blur-sm border border-gold-accent/5">
            <p className="text-xs text-gray-400 flex items-center">
              <span className="material-icons text-xs mr-1 text-neon-magenta/70">speed</span>
              Avg Speed
            </p>
            <p className="font-rajdhani font-medium">{ride.avgSpeed?.toFixed(1) || 0} km/h</p>
          </div>
          <div className="bg-dark-bg/50 rounded-lg p-2 backdrop-blur-sm border border-gold-accent/5">
            <p className="text-xs text-gray-400 flex items-center">
              <span className="material-icons text-xs mr-1 text-electric-purple/70">terrain</span>
              Elevation
            </p>
            <p className="font-rajdhani font-medium">{ride.elevation || 0} m</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RideHistoryCard;
