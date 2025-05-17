import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ParallaxCard from '@/components/ui/ParallaxCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRide } from '@/hooks/useRideData';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { saveCurrentUser, getCurrentUser } from '@/lib/storageUtils';

const ProfilePage: React.FC = () => {
  const { syncStatus, toggleSync } = useRide();
  const [username, setUsername] = useState('');
  const [trackingSettings, setTrackingSettings] = useState({
    highAccuracy: true,
    trackElevation: true,
    pauseWhenStopped: true,
    autoBackup: false
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUsername(currentUser.username);
    }
  }, []);
  
  const handleSaveProfile = () => {
    const currentUser = getCurrentUser();
    if (currentUser && username) {
      saveCurrentUser({
        ...currentUser,
        username
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
        variant: "default",
      });
    }
  };
  
  const handleSettingChange = (setting: keyof typeof trackingSettings) => {
    setTrackingSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast({
      title: "Setting Updated",
      description: `${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${trackingSettings[setting] ? 'disabled' : 'enabled'}`,
      variant: "default",
    });
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="font-rajdhani font-bold text-3xl">Your Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account and settings</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <ParallaxCard className="bg-dark-surface rounded-xl p-5">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-electric-purple flex items-center justify-center text-white text-4xl font-rajdhani font-bold mb-4">
                {username.charAt(0).toUpperCase()}
              </div>
              
              <h2 className="font-rajdhani font-bold text-2xl mb-1">{username}</h2>
              <p className="text-gray-400 mb-6">Offline user</p>
              
              <div className="w-full">
                <div className="mb-4">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="bg-dark-bg text-white border-neon-cyan/20 mt-1"
                  />
                </div>
                
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90"
                >
                  Save Profile
                </Button>
              </div>
            </div>
          </ParallaxCard>
        </div>
        
        <div className="md:col-span-7">
          <Card className="bg-dark-surface border-neon-cyan/20">
            <CardHeader>
              <CardTitle className="font-rajdhani text-2xl">Settings</CardTitle>
              <CardDescription>Configure your tracking preferences</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Cloud Sync</h3>
                  <p className="text-sm text-gray-400">Enable or disable cloud synchronization</p>
                </div>
                <Switch 
                  checked={syncStatus === 'online'} 
                  onCheckedChange={toggleSync}
                  className="data-[state=checked]:bg-neon-cyan"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">High Accuracy GPS</h3>
                  <p className="text-sm text-gray-400">Use high accuracy mode (consumes more battery)</p>
                </div>
                <Switch 
                  checked={trackingSettings.highAccuracy} 
                  onCheckedChange={() => handleSettingChange('highAccuracy')}
                  className="data-[state=checked]:bg-neon-cyan"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Track Elevation</h3>
                  <p className="text-sm text-gray-400">Record elevation changes during rides</p>
                </div>
                <Switch 
                  checked={trackingSettings.trackElevation} 
                  onCheckedChange={() => handleSettingChange('trackElevation')}
                  className="data-[state=checked]:bg-neon-cyan"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Auto-Pause</h3>
                  <p className="text-sm text-gray-400">Automatically pause tracking when not moving</p>
                </div>
                <Switch 
                  checked={trackingSettings.pauseWhenStopped} 
                  onCheckedChange={() => handleSettingChange('pauseWhenStopped')}
                  className="data-[state=checked]:bg-neon-cyan"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Auto Backup</h3>
                  <p className="text-sm text-gray-400">Automatically backup ride data when connected</p>
                </div>
                <Switch 
                  checked={trackingSettings.autoBackup} 
                  onCheckedChange={() => handleSettingChange('autoBackup')}
                  className="data-[state=checked]:bg-neon-cyan"
                />
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-neon-cyan/10 pt-6">
              <Button 
                className="bg-neon-magenta text-white hover:bg-neon-magenta/90"
                onClick={() => {
                  toast({
                    title: "Settings Reset",
                    description: "All settings have been reset to defaults",
                    variant: "default",
                  });
                  
                  setTrackingSettings({
                    highAccuracy: true,
                    trackElevation: true,
                    pauseWhenStopped: true,
                    autoBackup: false
                  });
                }}
              >
                Reset to Defaults
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-dark-surface border-neon-cyan/20 mt-6">
            <CardHeader>
              <CardTitle className="font-rajdhani text-2xl">About CycleTrac</CardTitle>
              <CardDescription>Version 1.0.0</CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-400">
                CycleTrac is an offline-first bicycle tracking app designed for cyclists who want
                to track their rides without requiring constant internet connectivity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
