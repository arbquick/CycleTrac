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
          <h2 className="font-rajdhani font-bold text-2xl">Recent Rides</h2>
          <a href="/routes" className="text-neon-cyan text-sm hover:underline">View All</a>
        </div>
        
        {recentRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-container">
            {recentRides.map((ride) => (
              <RideHistoryCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <ParallaxCard className="bg-dark-surface rounded-xl p-6 text-center">
            <div className="py-8">
              <motion.div 
                className="material-icons text-4xl mb-4 text-neon-cyan"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                directions_bike
              </motion.div>
              <h3 className="font-rajdhani text-xl font-semibold mb-2">No Rides Yet</h3>
              <p className="text-gray-400 mb-6">Start recording your first ride to see it here</p>
              <a 
                href="/new-ride" 
                className="inline-flex items-center px-6 py-3 bg-neon-cyan text-black font-semibold rounded-full"
              >
                <span className="material-icons mr-2">add</span>
                Start New Ride
              </a>
            </div>
          </ParallaxCard>
        )}
      </section>
    </motion.div>
  );
};

export default DashboardPage;
