import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ParallaxCard from '@/components/ui/ParallaxCard';
import { getLocalRides } from '@/lib/storageUtils';
import { Ride } from '@shared/schema';

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalRides: 0,
    totalDistance: 0,
    totalDuration: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    totalElevation: 0,
    thisWeekDistance: 0,
    thisMonthDistance: 0
  });
  
  const [weeklyData, setWeeklyData] = useState<{ day: string; distance: number }[]>([]);
  
  useEffect(() => {
    // Load rides from local storage
    const rides = getLocalRides();
    
    if (rides.length === 0) {
      return;
    }
    
    // Calculate total stats
    const totalDistance = rides.reduce((sum, ride) => sum + (ride.distance || 0), 0);
    const totalDuration = rides.reduce((sum, ride) => sum + (ride.duration || 0), 0);
    const maxSpeed = Math.max(...rides.map(ride => ride.maxSpeed || 0));
    const totalElevation = rides.reduce((sum, ride) => sum + (ride.elevation || 0), 0);
    
    // This week's stats
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const ridesThisWeek = rides.filter(ride => 
      new Date(ride.startTime) >= startOfWeek
    );
    
    const thisWeekDistance = ridesThisWeek.reduce(
      (sum, ride) => sum + (ride.distance || 0), 
      0
    );
    
    // This month's stats
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const ridesThisMonth = rides.filter(ride => 
      new Date(ride.startTime) >= startOfMonth
    );
    
    const thisMonthDistance = ridesThisMonth.reduce(
      (sum, ride) => sum + (ride.distance || 0), 
      0
    );
    
    // Calculate weekly data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyDistances = Array(7).fill(0);
    
    ridesThisWeek.forEach(ride => {
      const rideDate = new Date(ride.startTime);
      const dayIndex = rideDate.getDay();
      weeklyDistances[dayIndex] += (ride.distance || 0);
    });
    
    const weeklyDataFormatted = days.map((day, index) => ({
      day,
      distance: parseFloat(weeklyDistances[index].toFixed(1))
    }));
    
    setWeeklyData(weeklyDataFormatted);
    
    setStats({
      totalRides: rides.length,
      totalDistance: parseFloat(totalDistance.toFixed(1)),
      totalDuration,
      avgSpeed: totalDuration > 0 ? parseFloat((totalDistance / (totalDuration / 3600)).toFixed(1)) : 0,
      maxSpeed: parseFloat(maxSpeed.toFixed(1)),
      totalElevation,
      thisWeekDistance: parseFloat(thisWeekDistance.toFixed(1)),
      thisMonthDistance: parseFloat(thisMonthDistance.toFixed(1))
    });
  }, []);
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="font-rajdhani font-bold text-3xl">Your Statistics</h1>
        <p className="text-gray-400 mt-1">Track your cycling progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ParallaxCard className="bg-dark-surface rounded-xl p-4">
          <div className="flex flex-col h-full">
            <p className="text-sm text-gray-400">Total Rides</p>
            <h2 className="font-rajdhani text-3xl font-bold mt-2 text-neon-cyan">
              {stats.totalRides}
            </h2>
          </div>
        </ParallaxCard>
        
        <ParallaxCard className="bg-dark-surface rounded-xl p-4">
          <div className="flex flex-col h-full">
            <p className="text-sm text-gray-400">Total Distance</p>
            <h2 className="font-rajdhani text-3xl font-bold mt-2 text-neon-magenta">
              {stats.totalDistance} <span className="text-lg font-normal">km</span>
            </h2>
          </div>
        </ParallaxCard>
        
        <ParallaxCard className="bg-dark-surface rounded-xl p-4">
          <div className="flex flex-col h-full">
            <p className="text-sm text-gray-400">Total Time</p>
            <h2 className="font-rajdhani text-3xl font-bold mt-2 text-electric-purple">
              {formatDuration(stats.totalDuration)}
            </h2>
          </div>
        </ParallaxCard>
        
        <ParallaxCard className="bg-dark-surface rounded-xl p-4">
          <div className="flex flex-col h-full">
            <p className="text-sm text-gray-400">Avg Speed</p>
            <h2 className="font-rajdhani text-3xl font-bold mt-2 text-neon-cyan">
              {stats.avgSpeed} <span className="text-lg font-normal">km/h</span>
            </h2>
          </div>
        </ParallaxCard>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ParallaxCard className="bg-dark-surface rounded-xl p-4 md:col-span-2">
          <h3 className="font-rajdhani font-semibold text-xl mb-4">Weekly Distance</h3>
          
          <div className="h-60">
            <svg width="100%" height="100%" viewBox="0 0 500 240">
              {/* Grid lines */}
              <g className="chart-grid">
                <line x1="0" y1="240" x2="500" y2="240" />
                <line x1="0" y1="180" x2="500" y2="180" stroke-dasharray="5,5" />
                <line x1="0" y1="120" x2="500" y2="120" stroke-dasharray="5,5" />
                <line x1="0" y1="60" x2="500" y2="60" stroke-dasharray="5,5" />
                <line x1="0" y1="0" x2="500" y2="0" stroke-dasharray="5,5" />
              </g>
              
              {/* Render the bar chart */}
              {weeklyData.map((day, index) => {
                const barHeight = day.distance > 0 ? (day.distance / Math.max(...weeklyData.map(d => d.distance))) * 180 : 0;
                const x = 30 + index * 70;
                const y = 240 - barHeight;
                
                return (
                  <g key={index}>
                    <motion.rect
                      x={x - 20}
                      y={y}
                      width={40}
                      height={barHeight}
                      rx={5}
                      fill="url(#barGradient)"
                      initial={{ height: 0, y: 240 }}
                      animate={{ height: barHeight, y }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                    <text
                      x={x}
                      y={260}
                      textAnchor="middle"
                      fill="#9CA3AF"
                      fontSize="14"
                    >
                      {day.day}
                    </text>
                    <motion.text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="14"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    >
                      {day.distance > 0 ? day.distance : ''}
                    </motion.text>
                  </g>
                );
              })}
              
              {/* Gradient for bars */}
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0DF0FF" />
                  <stop offset="100%" stopColor="#9D00FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </ParallaxCard>
        
        <ParallaxCard className="bg-dark-surface rounded-xl p-4">
          <h3 className="font-rajdhani font-semibold text-xl mb-4">Period Summary</h3>
          
          <div className="space-y-4">
            <div className="bg-dark-bg p-3 rounded-lg">
              <p className="text-xs text-gray-400">This Week</p>
              <p className="font-rajdhani text-xl font-bold text-neon-cyan">
                {stats.thisWeekDistance} <span className="text-sm font-normal">km</span>
              </p>
            </div>
            
            <div className="bg-dark-bg p-3 rounded-lg">
              <p className="text-xs text-gray-400">This Month</p>
              <p className="font-rajdhani text-xl font-bold text-neon-magenta">
                {stats.thisMonthDistance} <span className="text-sm font-normal">km</span>
              </p>
            </div>
            
            <div className="bg-dark-bg p-3 rounded-lg">
              <p className="text-xs text-gray-400">Max Speed</p>
              <p className="font-rajdhani text-xl font-bold text-electric-purple">
                {stats.maxSpeed} <span className="text-sm font-normal">km/h</span>
              </p>
            </div>
            
            <div className="bg-dark-bg p-3 rounded-lg">
              <p className="text-xs text-gray-400">Total Elevation</p>
              <p className="font-rajdhani text-xl font-bold text-neon-cyan">
                {stats.totalElevation} <span className="text-sm font-normal">m</span>
              </p>
            </div>
          </div>
        </ParallaxCard>
      </div>
    </div>
  );
};

export default StatsPage;
