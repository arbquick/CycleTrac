import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import RouteMap from '@/components/ui/RouteMap';
import { useRide } from '@/hooks/useRideData';

const MapCard: React.FC = () => {
  const { currentRide } = useRide();
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.3 }
    }
  };

  return (
    <motion.div 
      className="bg-dark-surface rounded-xl overflow-hidden border-gradient"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="p-5 pb-3">
        <h3 className="font-rajdhani font-semibold text-xl">Current Route</h3>
      </div>
      <div className="map-container h-80 relative">
        <RouteMap routePoints={currentRide.routePoints} />
        
        {/* Elevation profile */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-bg/90 to-transparent px-4 pt-2">
          <h4 className="text-xs text-gray-400 mb-1">Elevation Profile</h4>
          <svg width="100%" height="40" viewBox="0 0 500 40">
            <motion.path 
              d="M0,30 L50,28 L100,25 L150,20 L200,15 L250,10 L300,15 L350,20 L400,25 L450,20 L500,15" 
              fill="none" 
              stroke="#9D00FF" 
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            
            <path 
              d="M0,30 L50,28 L100,25 L150,20 L200,15 L250,10 L300,15 L350,20 L400,25 L450,20 L500,15 L500,40 L0,40 Z" 
              fill="url(#elevationGradient)"
              opacity="0.5"
            />
            
            <defs>
              <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9D00FF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#9D00FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default MapCard;
