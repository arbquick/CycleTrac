import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import CurrentRideCard from '@/components/ride/CurrentRideCard';
import SpeedCard from '@/components/ride/SpeedCard';
import CadenceCard from '@/components/ride/CadenceCard';
import MapCard from '@/components/ride/MapCard';
import RideHistoryCard from '@/components/ride/RideHistoryCard';
import ParallaxCard from '@/components/ui/ParallaxCard';
import { useRide } from '@/hooks/useRideData';
import { Ride } from '@shared/schema';
import { getLocalRides } from '@/lib/storageUtils';

const DashboardPage: React.FC = () => {
  const { currentRide } = useRide();
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  
  // Get recent rides from local storage
  useEffect(() => {
    const rides = getLocalRides();
    // Sort by start time, most recent first
    const sortedRides = [...rides].sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
    setRecentRides(sortedRides.slice(0, 3));
  }, [currentRide.isActive]);
  
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <motion.div 
      className="py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Current Ride Section */}
      {currentRide.isActive && (
        <section className="mt-6 perspective-container">
          <CurrentRideCard />
        </section>
      )}
      
      {currentRide.isActive && (
        <>
          {/* Speed & Cadence Section */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 perspective-container">
            <SpeedCard />
            <CadenceCard />
          </section>
          
          {/* Map Section */}
          <section className="mt-8 perspective-container">
            <MapCard />
          </section>
        </>
      )}
      
      {/* Recent Rides Section */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-rajdhani font-bold text-2xl relative inline-block gold-highlight">
            Recent Rides
            <span className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-gold-accent/30"></span>
          </h2>
          <a href="/routes" className="text-gold-accent text-sm hover:underline transition-all duration-300 hover:text-neon-cyan flex items-center">
            <span>View All</span>
            <span className="material-icons ml-1 text-sm">arrow_forward</span>
          </a>
        </div>
        
        {recentRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-container">
            {recentRides.map((ride) => (
              <RideHistoryCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <ParallaxCard className="premium-glass rounded-xl p-6 text-center border border-gold-accent/10 animate-entrance">
            <div className="py-10 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gold-accent/5 via-transparent to-neon-cyan/5 opacity-30 rounded-xl"></div>
              <motion.div 
                className="material-icons text-5xl mb-6 bg-gradient-to-r from-gold-accent to-neon-cyan bg-clip-text text-transparent"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  y: { duration: 2, repeat: Infinity, repeatType: "reverse" },
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                directions_bike
              </motion.div>
              <h3 className="font-rajdhani text-2xl font-bold mb-3 text-white">No Rides Yet</h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">Start recording your cycling journey to view your performance data and routes</p>
              <a 
                href="/new-ride" 
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-gold-accent to-neon-cyan text-black font-semibold rounded-full shadow-premium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <span className="material-icons mr-2">add</span>
                Start Your First Ride
              </a>
            </div>
          </ParallaxCard>
        )}
      </section>
    </motion.div>
  );
};

export default DashboardPage;
