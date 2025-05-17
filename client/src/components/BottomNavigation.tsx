import React from 'react';
import { Link, useLocation } from 'wouter';

const BottomNavigation: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  // Helper to get active class depending on the path
  const getNavItemClasses = (path: string) => {
    if (isActive(path)) {
      return "flex flex-col items-center text-white bg-gradient-to-r from-neon-cyan/20 to-gold-accent/10 rounded-full px-6 py-2 border border-neon-cyan/20";
    }
    return "flex flex-col items-center text-gray-400 hover:text-white transition-all duration-300 hover:bg-gold-accent/5 px-6 py-2 border border-transparent";
  };

  // Helper to get active icon color
  const getIconColor = (path: string) => {
    if (isActive(path)) {
      return "text-neon-cyan";
    }
    return "group-hover:text-gold-accent";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-dark-bg/90 border-t border-gold-accent/20 z-50">
      <div className="container mx-auto flex justify-around items-center py-3">
        <Link href="/" className={`group ${getNavItemClasses("/")}`}>
          <span className={`material-icons ${getIconColor("/")}`}>speed</span>
          <span className="text-xs mt-1 font-medium">Track</span>
        </Link>
        
        <Link href="/routes" className={`group ${getNavItemClasses("/routes")}`}>
          <span className={`material-icons ${getIconColor("/routes")}`}>route</span>
          <span className="text-xs mt-1">Routes</span>
        </Link>
        
        <Link href="/new-ride" className="bg-gradient-to-br from-neon-cyan via-gold-accent to-neon-magenta rounded-full p-4 -mt-8 text-black glow-gold animate-pulse-gold relative">
          <span className="material-icons">add</span>
          <span className="absolute inset-0 bg-white rounded-full blur-md opacity-20 animate-pulse"></span>
        </Link>
        
        <Link href="/stats" className={`group ${getNavItemClasses("/stats")}`}>
          <span className={`material-icons ${getIconColor("/stats")}`}>leaderboard</span>
          <span className="text-xs mt-1">Stats</span>
        </Link>
        
        <Link href="/profile" className={`group ${getNavItemClasses("/profile")}`}>
          <span className={`material-icons ${getIconColor("/profile")}`}>person</span>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
