import React, { useState, useEffect } from 'react';
import { AppView, User, ChatSession } from '../types';
import { llmAdapter } from '../services/llm';
import { UIConfig } from './UIAdjuster';


interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  user: User | null;
  onLogout: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  uiConfig?: UIConfig;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView, onViewChange, isOpen, toggleOpen, user, onLogout,
  sessions, currentSessionId, onSelectSession, onNewSession, onDeleteSession, onRenameSession,
  uiConfig
}) => {
  const [quota, setQuota] = useState(llmAdapter.getQuota());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    llmAdapter.onQuotaUpdate((newQuota) => {
      setQuota(newQuota);
    });
  }, []);

  const navItems = [
    // CATEGORY: NVIDIA TACTICAL (PURE WHITE - ELITE)
    { id: AppView.CHAT, label: 'Tactical Core', icon: 'fa-terminal', color: '#ffffff' },
    { id: AppView.AUTO_EDA, label: 'Visual HUD', icon: 'fa-eye', color: '#ffffff' },
    { id: AppView.NOTEBOOK, label: 'Quantum Notebook', icon: 'fa-code', color: '#ffffff' },
    { id: AppView.DATA_CLEANER, label: 'Data Forensics', icon: 'fa-biohazard', color: '#ffffff' },
    { id: AppView.AUTOML, label: 'AutoML Lab', icon: 'fa-flask', color: '#ffffff' },
    { id: AppView.ARCHITECT, label: 'War Room', icon: 'fa-chess-board', color: '#ffffff' },
    { id: AppView.DEVOPS, label: 'Base Ops', icon: 'fa-gear', color: '#ffffff' },

    // CATEGORY: INTELLIGENCE NODES (GREEN) - BASE LAYER
    { id: AppView.DASHBOARD, label: 'Mission Control', icon: 'fa-gauge-high', color: '#76b900' },
    { id: AppView.CAREER, label: 'Career Ops', icon: 'fa-briefcase', color: '#76b900' },
    { id: AppView.KAGGLE_HUB, label: 'Kaggle Ops', icon: 'fa-chess-board', color: '#76b900' },
    { id: AppView.LIVE, label: 'Voice Comms', icon: 'fa-headset', color: '#76b900' },
    { id: AppView.VISION, label: 'Intel Scan', icon: 'fa-crosshairs', color: '#76b900' },
    { id: AppView.GROUNDING, label: 'Deep Grounding', icon: 'fa-satellite', color: '#76b900' },
    { id: AppView.DEEP_RESEARCH, label: 'Deep Intel', icon: 'fa-microchip', color: '#76b900' },
    { id: AppView.SECURITY, label: 'Security Hub', icon: 'fa-lock', color: '#76b900' },

    // CATEGORY: CREATIVE / DESIGN (AMBER)
    { id: AppView.DESIGNER, label: 'UI Designer', icon: 'fa-palette', color: '#f59e0b' },
  ];

  const groqPercent = (quota?.groq?.tokens) ? Math.min(Math.round((quota.groq.tokens / 30000) * 100), 100) : 100;
  const geminiLimit = quota?.gemini?.limit || 15;
  const geminiCount = quota?.gemini?.count || 0;
  const geminiPercent = Math.max(Math.round(((geminiLimit - geminiCount) / geminiLimit) * 100), 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={toggleOpen}
        ></div>
      )}

      <aside
        style={{ width: isOpen ? `${uiConfig?.sidebarWidth || 320}px` : undefined }}
        className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-24'}
        fixed md:relative h-[100dvh] md:h-full inset-y-0 left-0 z-50 md:z-10 bg-[#020203] border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out shrink-0 select-none overflow-hidden
      `}>
        {/* LOGO AREA */}
        <div className="p-8 pb-4 flex items-center gap-4 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#76b900] to-[#5a8c00] flex items-center justify-center text-black shadow-[0_0_30px_rgba(118,185,0,0.3)] hover:scale-105 transition-transform cursor-pointer">
            <i className="fa-solid fa-ghost text-xl"></i>
          </div>
          {isOpen && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="orbitron font-black text-xl tracking-tighter italic text-white leading-none">ATLAS<span className="text-[#76b900]">_X</span></span>
              <span className="text-[7px] font-bold text-[#76b900]/40 tracking-[0.5em] uppercase mt-1">NVIDIA_LOGIC_CORE</span>
            </div>
          )}
        </div>

        {/* NEW SESSION BUTTON */}
        <div className="px-6 py-4 shrink-0">
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 768) toggleOpen();
            }}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#76b900]/30 transition-all group active:scale-95 shadow-lg ${!isOpen ? 'px-0' : 'px-4'}`}
          >
            <i className="fa-solid fa-plus text-xs text-[#76b900] animate-pulse"></i>
            {isOpen && (
              <span className="text-[10px] orbitron font-black text-white uppercase tracking-[0.2em]">
                New Mission
              </span>
            )}
          </button>
        </div>

        {/* NAVIGATION SECTOR - RESPONSIVE SCROLL */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 pt-2 scroll-smooth touch-pan-y">
          <nav className="space-y-1 pb-32">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const themeColor = item.color;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 768) toggleOpen();
                  }}
                  className={`w-full group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative ${isActive
                    ? 'bg-gradient-to-r from-white/10 to-transparent text-white'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <div style={{ backgroundColor: themeColor }} className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full shadow-[0_0_20px_currentColor] z-50"></div>
                  )}

                  <div
                    style={{ color: isActive ? themeColor : 'inherit' }}
                    className={`w-6 flex justify-center text-lg transition-all ${isActive ? 'opacity-100 scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      {isOpen && (
                        <span className={`text-[10px] orbitron font-bold uppercase tracking-[0.2em] truncate transition-all ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                          {item.label}
                        </span>
                      )}
                      {isActive && <div style={{ backgroundColor: themeColor }} className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] animate-pulse"></div>}
                    </div>
                    {/* MINI FUEL BAR */}
                    {isOpen && (
                      <div className="mt-1.5 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${item.id === AppView.AUTO_EDA ? groqPercent : (item.color === '#76b900' ? geminiPercent : 100)}%`,
                            backgroundColor: themeColor
                          }}
                          className="h-full transition-all duration-1000 shadow-[0_0_5px_currentColor]"
                        ></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SYSTEM STATUS & USER */}
        <div className="mt-auto border-t border-white/5 p-6 bg-black/60 shrink-0 space-y-6">
          {isOpen && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {/* USER IDENTITY */}
              {user && (
                <div className="flex items-center gap-4 p-2 bg-white/5 rounded-2xl border border-white/5">
                  <div className="relative">
                    <img src={user.avatar} className="w-10 h-10 rounded-xl border border-white/10 shadow-lg" alt="Commander" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#76b900] border-2 border-[#020203] rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] orbitron font-black text-white truncate uppercase">{user.name}</span>
                    <span className="text-[8px] orbitron text-[#76b900] font-bold tracking-widest uppercase">{user.rank}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <button onClick={() => onViewChange(AppView.SETTINGS)} className={`w-full flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-white transition-all rounded-xl hover:bg-white/5 group ${currentView === AppView.SETTINGS ? 'bg-white/5 text-white' : ''}`}>
              <i className={`fa-solid fa-gear text-sm group-hover:text-[#76b900] transition-transform group-hover:rotate-45 ${currentView === AppView.SETTINGS ? 'text-[#76b900]' : ''}`}></i>
              {isOpen && <span className="text-[9px] orbitron font-black uppercase tracking-[0.3em]">Configure System</span>}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={toggleOpen}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title={isOpen ? "Collapse Terminal" : "Expand Terminal"}
              >
                <i className={`fa-solid ${isOpen ? 'fa-angles-left' : 'fa-angles-right'} text-xs`}></i>
              </button>

              {isOpen && (
                <button onClick={onLogout} className="text-[9px] orbitron font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-all p-2 px-4 hover:bg-red-500/5 rounded-xl flex items-center gap-2">
                  <i className="fa-solid fa-power-off"></i> SHUTDOWN
                </button>
              )}
            </div>
          </div>

          {isOpen && (
            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-[7px] orbitron font-bold text-gray-700 uppercase tracking-[0.4em] italic">
                Licensed to <span className="text-gray-500">M U RAY</span>
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
