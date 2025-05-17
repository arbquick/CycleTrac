import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ride } from '@shared/schema';
import RideHistoryCard from '@/components/ride/RideHistoryCard';
import { getLocalRides, deleteRide } from '@/lib/storageUtils';
import ParallaxCard from '@/components/ui/ParallaxCard';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const RoutesPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load rides from local storage
    const localRides = getLocalRides();
    // Sort by start time, most recent first
    const sortedRides = [...localRides].sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
    setRides(sortedRides);
  }, []);
  
  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedRide) return;
    
    try {
      const success = await deleteRide(selectedRide.id);
      
      if (success) {
        setRides(rides.filter(ride => ride.id !== selectedRide.id));
        setIsDeleteDialogOpen(false);
        setIsDialogOpen(false);
        
        toast({
          title: "Ride deleted",
          description: "The ride has been successfully deleted",
          variant: "default",
        });
      } else {
        throw new Error("Failed to delete ride");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="font-rajdhani font-bold text-3xl">Your Routes</h1>
        <p className="text-gray-400 mt-1">View and manage your recorded rides</p>
      </div>
      
      {rides.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {rides.map((ride) => (
            <RideHistoryCard 
              key={ride.id} 
              ride={ride} 
              onClick={() => handleRideClick(ride)}
            />
          ))}
        </motion.div>
      ) : (
        <ParallaxCard className="bg-dark-surface rounded-xl p-6 text-center">
          <div className="py-8">
            <motion.div 
              className="material-icons text-4xl mb-4 text-neon-cyan"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              route
            </motion.div>
            <h3 className="font-rajdhani text-xl font-semibold mb-2">No Routes Yet</h3>
            <p className="text-gray-400 mb-6">Start recording your rides to build your route collection</p>
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
      
      {/* Ride Details Dialog */}
      {selectedRide && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-dark-surface text-white border-neon-cyan/20 max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-rajdhani text-2xl">
                {selectedRide.title}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {new Date(selectedRide.startTime).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="bg-dark-bg p-3 rounded-lg">
                <p className="text-xs text-gray-400">Distance</p>
                <p className="font-rajdhani text-xl font-semibold">
                  {selectedRide.distance?.toFixed(1) || 0} km
                </p>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg">
                <p className="text-xs text-gray-400">Duration</p>
                <p className="font-rajdhani text-xl font-semibold">
                  {Math.floor((selectedRide.duration || 0) / 3600)}h {Math.floor(((selectedRide.duration || 0) % 3600) / 60)}m
                </p>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg">
                <p className="text-xs text-gray-400">Avg Speed</p>
                <p className="font-rajdhani text-xl font-semibold">
                  {selectedRide.avgSpeed?.toFixed(1) || 0} km/h
                </p>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg">
                <p className="text-xs text-gray-400">Max Speed</p>
                <p className="font-rajdhani text-xl font-semibold">
                  {selectedRide.maxSpeed?.toFixed(1) || 0} km/h
                </p>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg col-span-2">
                <p className="text-xs text-gray-400">Elevation Gain</p>
                <p className="font-rajdhani text-xl font-semibold">
                  {selectedRide.elevation || 0} m
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button 
                variant="destructive" 
                onClick={handleDeleteClick}
                className="bg-red-900 hover:bg-red-800"
              >
                Delete
              </Button>
              <DialogClose asChild>
                <Button className="bg-neon-cyan text-black hover:bg-neon-cyan/90">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-dark-surface text-white border-red-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-rajdhani text-xl">
              Delete Ride
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this ride? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutesPage;
