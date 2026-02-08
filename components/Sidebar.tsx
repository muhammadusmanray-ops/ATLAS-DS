
import React from 'react';
import { AppView, User } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, toggleOpen, user, onLogout }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Mission Control', icon: 'fa-gauge-high' },
    { id: AppView.CHAT, label: 'Tactical Core', icon: 'fa-microchip' },
    { id: AppView.CAREER, label: 'Career Ops', icon: 'fa-briefcase' },
    { id: AppView.KAGGLE_HUB, label: 'Kaggle Ops', icon: 'fa-chess-board' },
    { id: AppView.NOTEBOOK, label: 'Quantum Notebook', icon: 'fa-code' },
    { id: AppView.AUTOML, label: 'AutoML Lab', icon: 'fa-flask' },
    { id: AppView.LIVE, label: 'Voice Comms', icon: 'fa-headset' },
    { id: AppView.DATA_CLEANER, label: 'Data Forensics', icon: 'fa-biohazard' },
    { id: AppView.AUTO_EDA, label: 'Intel Scan', icon: 'fa-crosshairs' },
    { id: AppView.VISION, label: 'Visual HUD', icon: 'fa-eye' },
    { id: AppView.ARCHITECT, label: 'War Room', icon: 'fa-map' },
    { id: AppView.DEVOPS, label: 'Base Ops', icon: 'fa-gear' },
    { id: AppView.GROUNDING, label: 'Deep Grounding', icon: 'fa-satellite' },
    { id: AppView.SECURITY, label: 'Security Hub', icon: 'fa-lock' },
  ];

  return (
    <aside className={`${isOpen ? 'w-80' : 'w-20'} h-full bg-[#050508] border-r border-white/5 flex flex-col z-50 transition-all duration-500 relative`}>
      {/* HUD Logo Section */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-[#00f3ff] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,243,255,0.3)] shrink-0">
            <i className="fa-solid fa-skull-crossbones text-xl animate-pulse"></i>
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="orbitron font-black text-xl tracking-tighter italic text-white leading-none">ATLAS<span className="text-[#00f3ff]">X</span></span>
              <span className="text-[7px] font-bold text-[#00f3ff]/40 tracking-[0.5em] uppercase mt-1">Combat Data v3</span>
            </div>
          )}
        </div>
      </div>

      {/* New Tactical Session Button */}
      {isOpen && (
        <div className="px-4 py-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group">
            <i className="fa-solid fa-plus text-xs text-[#00f3ff]"></i>
            <span className="text-xs orbitron font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">New Session</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar pt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-[#00f3ff]/10 text-[#00f3ff] shadow-[inset_0_0_15px_rgba(0,243,255,0.05)]' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className={`w-5 flex justify-center text-lg transition-transform group-hover:scale-125`}>
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            {isOpen && <span className="text-[10px] orbitron font-bold uppercase tracking-[0.2em] truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Profile & Controls */}
      <div className="mt-auto border-t border-white/5 p-4 bg-black/40">
        {isOpen && user && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-black border border-indigo-500/10">
            <div className="flex items-center gap-3 mb-4">
              <img src={user.avatar} className="w-9 h-9 rounded-lg border border-[#00f3ff]/20" alt="Commander" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] orbitron font-black text-white truncate">{user.name}</span>
                <span className="text-[8px] orbitron text-[#00f3ff] opacity-50 tracking-widest uppercase">Rank: {user.rank}</span>
              </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-[7px] orbitron font-bold text-gray-600 uppercase">
                    <span>Neural Sync</span>
                    <span className="text-[#00f3ff]">98%</span>
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00f3ff] w-[98%] shadow-[0_0_5px_#00f3ff]"></div>
                </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          {isOpen && (
             <button onClick={() => onViewChange(AppView.SETTINGS)} className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-white transition-colors">
               <i className="fa-solid fa-gear text-xs"></i>
               <span className="text-[9px] orbitron font-bold uppercase tracking-widest">Config</span>
             </button>
          )}

          <div className="flex items-center justify-between px-2">
            <button onClick={toggleOpen} className="p-2 text-gray-500 hover:text-white transition-colors">
              <i className={`fa-solid ${isOpen ? 'fa-angles-left' : 'fa-angles-right'}`}></i>
            </button>
            {isOpen && (
              <button onClick={onLogout} className="text-[9px] orbitron font-bold text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors">
                  <i className="fa-solid fa-power-off mr-2"></i> Shutdown
              </button>
            )}
          </div>
          
          {isOpen && (
              <div className="mt-2 flex items-center justify-center gap-2 opacity-30">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[8px] font-mono text-green-500 uppercase tracking-widest">Net Link: Stable</span>
              </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
