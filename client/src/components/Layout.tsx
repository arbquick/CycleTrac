import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { useRide } from '@/hooks/useRideData';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { syncStatus, toggleSync } = useRide();

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <Header syncStatus={syncStatus} onSyncToggle={toggleSync} />
      <main className="flex-1 container mx-auto px-4 pb-24">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;
