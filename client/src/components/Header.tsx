import React from 'react';

interface HeaderProps {
  syncStatus: 'online' | 'offline';
  onSyncToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ syncStatus, onSyncToggle }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-dark-bg/90 border-b border-neon-cyan/20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-rajdhani font-bold text-2xl text-white">
            <span className="text-neon-cyan">CYCLE</span>
            <span className="text-neon-magenta">TRAC</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="bg-dark-surface p-2 rounded-full hover:bg-neon-cyan/10 transition-all" 
            aria-label="Settings"
          >
            <span className="material-icons text-neon-cyan">settings</span>
          </button>
          <button 
            className="bg-dark-surface p-2 rounded-full hover:bg-neon-cyan/10 transition-all" 
            data-sync-status={syncStatus} 
            aria-label={`Sync Status: ${syncStatus === 'online' ? 'Online' : 'Offline'}`}
            onClick={onSyncToggle}
          >
            <span className={`material-icons ${
              syncStatus === 'online' ? 'text-neon-cyan' : 'text-gray-400'
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
