import React from 'react';

interface HeaderProps {
  syncStatus: 'online' | 'offline';
  onSyncToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ syncStatus, onSyncToggle }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-dark-bg/90 border-b border-gold-accent/20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-rajdhani font-bold text-3xl text-white relative">
            <span className="text-neon-cyan animate-subtle-rotate inline-block">CYCLE</span>
            <span className="text-neon-magenta">TRAC</span>
            <span className="absolute -bottom-1 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold-accent/50 to-transparent"></span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="bg-dark-surface p-2 rounded-full hover:bg-gold-accent/10 transition-all border border-transparent hover:border-gold-accent/30" 
            aria-label="Settings"
          >
            <span className="material-icons text-gold-accent">settings</span>
          </button>
          <button 
            className={`bg-dark-surface p-2 rounded-full transition-all border border-transparent ${
              syncStatus === 'online' 
                ? 'hover:bg-neon-cyan/10 hover:border-neon-cyan/30' 
                : 'hover:bg-neon-magenta/10 hover:border-neon-magenta/30'
            }`}
            data-sync-status={syncStatus} 
            aria-label={`Sync Status: ${syncStatus === 'online' ? 'Online' : 'Offline'}`}
            onClick={onSyncToggle}
          >
            <span className={`material-icons ${
              syncStatus === 'online' ? 'text-neon-cyan' : 'text-neon-magenta/70'
            }`}>
              {syncStatus === 'online' ? 'cloud_done' : 'cloud_off'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
