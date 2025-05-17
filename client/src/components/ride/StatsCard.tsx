import React from 'react';
import { motion } from 'framer-motion';

type ColorType = 'cyan' | 'magenta' | 'purple';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color: ColorType;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, unit, color }) => {
  // Set border color based on the color prop
  const getBorderColor = () => {
    switch (color) {
      case 'cyan':
        return 'border-neon-cyan/20 hover:border-neon-cyan/60';
      case 'magenta':
        return 'border-neon-magenta/20 hover:border-neon-magenta/60';
      case 'purple':
        return 'border-electric-purple/20 hover:border-electric-purple/60';
      default:
        return 'border-neon-cyan/20 hover:border-neon-cyan/60';
    }
  };

  return (
    <motion.div
      className={`bg-dark-bg rounded-lg p-4 border ${getBorderColor()} transition-all`}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      <p className="text-xs uppercase text-gray-400 mb-1">{title}</p>
      <p className="font-rajdhani text-3xl font-bold text-white">
        {value}
        {unit && <span className="text-sm font-normal">{unit}</span>}
      </p>
    </motion.div>
  );
};

export default StatsCard;
