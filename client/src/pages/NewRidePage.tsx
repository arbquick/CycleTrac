import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRide } from '@/hooks/useRideData';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const NewRidePage: React.FC = () => {
  const [rideTitle, setRideTitle] = useState('New Ride');
  const { startRide, currentRide } = useRide();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleStartRide = () => {
    if (!rideTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your ride",
        variant: "destructive",
      });
      return;
    }
    
    // Request permission for geolocation if needed
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          initiateRide();
        } else {
          // Request geolocation permission
          navigator.geolocation.getCurrentPosition(
            () => initiateRide(),
            (error) => {
              toast({
                title: "Location Access Denied",
                description: "CycleTrac needs location access to track your ride",
                variant: "destructive",
              });
            }
          );
        }
      });
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your device doesn't support geolocation tracking",
        variant: "destructive",
      });
    }
  };
  
  const initiateRide = () => {
    startRide(rideTitle);
    toast({
      title: "Ride Started",
      description: "Your ride is now being tracked. Enjoy your journey!",
      variant: "default",
    });
    setLocation('/');
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="font-rajdhani font-bold text-3xl">Start New Ride</h1>
        <p className="text-gray-400 mt-1">Begin tracking your cycling journey</p>
      </div>
      
      <motion.div 
        className="max-w-md mx-auto bg-dark-surface rounded-xl p-6 border-gradient"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <Label htmlFor="ride-title" className="text-white mb-2 block">Ride Title</Label>
          <Input 
            id="ride-title"
            value={rideTitle}
            onChange={(e) => setRideTitle(e.target.value)}
            placeholder="Enter a name for your ride"
            className="bg-dark-bg border-neon-cyan/20 text-white"
          />
        </div>
        
        <div className="bg-dark-bg rounded-lg p-4 mb-6">
          <h3 className="font-rajdhani font-semibold text-lg mb-2">Tracking Information</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <span className="material-icons text-neon-cyan mr-2 text-base">gps_fixed</span>
              GPS location will be tracked
            </li>
            <li className="flex items-center">
              <span className="material-icons text-neon-cyan mr-2 text-base">speed</span>
              Speed will be calculated
            </li>
            <li className="flex items-center">
              <span className="material-icons text-neon-cyan mr-2 text-base">trending_up</span>
              Elevation changes will be recorded
            </li>
            <li className="flex items-center">
              <span className="material-icons text-neon-cyan mr-2 text-base">storage</span>
              All data is stored locally on your device
            </li>
          </ul>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleStartRide}
            className="bg-neon-cyan text-black hover:bg-neon-cyan/90 font-bold py-3 px-8 rounded-full transition-all animate-pulse-cyan text-lg"
            disabled={currentRide.isActive}
          >
            <span className="flex items-center">
              <span className="material-icons mr-2">play_arrow</span>
              START TRACKING
            </span>
          </Button>
        </div>
      </motion.div>
      
      <motion.div 
        className="mt-10 max-w-md mx-auto bg-dark-surface/50 rounded-xl p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-sm text-gray-400">
          <span className="material-icons text-neon-magenta align-middle mr-1 text-base">battery_alert</span>
          Remember that GPS tracking may consume significant battery power during extended rides.
        </p>
      </motion.div>
    </div>
  );
};

export default NewRidePage;
