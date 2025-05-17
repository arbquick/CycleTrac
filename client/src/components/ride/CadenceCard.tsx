import React from 'react';
import { motion } from 'framer-motion';
import { useRide } from '@/hooks/useRideData';

const CadenceCard: React.FC = () => {
  const { currentRide } = useRide();
  
  // Calculate gauge percentage (0-100 scale)
  const calculateGaugePercentage = () => {
    // Assuming max cadence of 120 RPM for full gauge
    const maxCadence = 120;
    const percentage = Math.min(100, (currentRide.currentCadence / maxCadence) * 100);
    return percentage;
  };
  
  // Calculate the stroke-dasharray value for the SVG path
  const dashArrayValue = () => {
    // Total length of the semi-circle is 140 (70 * 2)
    const totalLength = 140;
    const percentage = calculateGaugePercentage();
    return `${(percentage / 100) * totalLength}`;
  };

  return (
    <motion.div 
      className="bg-dark-surface rounded-xl p-5 border-gradient"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="font-rajdhani font-semibold text-xl mb-4">Cadence</h3>
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-rajdhani font-bold text-5xl text-neon-magenta">
              {Math.round(currentRide.currentCadence)}
            </span>
            <span className="font-rajdhani ml-1 text-xl text-neon-magenta">rpm</span>
          </div>
          {/* SVG Cadence Gauge */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="5"/>
            <path d="M50 5 A 45 45 0 0 1 95 50" fill="none" stroke="#FF00FF" strokeWidth="5" strokeLinecap="round"/>
            <motion.path 
              d="M50 5 A 45 45 0 0 1 95 50" 
              fill="none" 
              stroke="#FF00FF" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeDasharray={dashArrayValue()} 
              className="route-path" 
              style={{ filter: "drop-shadow(0 0 5px #FF00FF)" }}
              initial={{ strokeDashoffset: 60 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.5 }}
            />
          </svg>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm text-gray-400 mb-2">Cadence Trend</h4>
        <div className="h-16 bg-dark-bg rounded-lg p-2">
          {/* SVG Chart */}
          <svg width="100%" height="100%" viewBox="0 0 300 60">
            <motion.polyline
              points="0,30 20,35 40,32 60,30 80,35 100,40 120,38 140,35 160,30 180,25 200,30 220,35 240,30 260,25 280,30 300,35"
              fill="none"
              stroke="#FF00FF"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            <polyline
              points="0,30 20,35 40,32 60,30 80,35 100,40 120,38 140,35 160,30 180,25 200,30 220,35 240,30 260,25 280,30 300,35"
              fill="none"
              stroke="rgba(255, 0, 255, 0.3)"
              strokeWidth="6"
              strokeLinecap="round"
              filter="blur(8px)"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default CadenceCard;
