import React, { useState, useEffect } from 'react';
import { AppView, User, ChatSession } from '../types';
import { llmAdapter } from '../services/llm';


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
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView, onViewChange, isOpen, toggleOpen, user, onLogout,
  sessions, currentSessionId, onSelectSession, onNewSession, onDeleteSession, onRenameSession
}) => {
  const [quota, setQuota] = useState(llmAdapter.getQuota());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    llmAdapter.onQuotaUpdate((newQuota) => {
      setQuota(newQuota);
    });
  }, []);

  const navItems = [
    { id: AppView.CHAT, label: 'Tactical Core', icon: 'fa-terminal', provider: 'groq' },
    { id: AppView.DEEP_RESEARCH, label: 'Deep Intel', icon: 'fa-microchip', provider: 'groq' },
    { id: AppView.AUTO_EDA, label: 'Visual HUD', icon: 'fa-eye', provider: 'groq' },
    { id: AppView.NOTEBOOK, label: 'Quantum Notebook', icon: 'fa-code', provider: 'groq' },
    { id: AppView.DATA_CLEANER, label: 'Data Forensics', icon: 'fa-biohazard', provider: 'groq' },
    { id: AppView.AUTOML, label: 'AutoML Lab', icon: 'fa-flask', provider: 'groq' },
    { id: AppView.ARCHITECT, label: 'War Room', icon: 'fa-chess-board', provider: 'groq' },
    { id: AppView.GROUNDING, label: 'Deep Grounding', icon: 'fa-satellite', provider: 'groq' },
    { id: AppView.DEVOPS, label: 'Base Ops', icon: 'fa-gear', provider: 'groq' },
    { id: AppView.DASHBOARD, label: 'Mission Control', icon: 'fa-gauge-high', provider: 'gemini' },
    { id: AppView.CAREER, label: 'Career Ops', icon: 'fa-briefcase', provider: 'gemini' },
    { id: AppView.KAGGLE_HUB, label: 'Kaggle Ops', icon: 'fa-chess-board', provider: 'gemini' },
    { id: AppView.LIVE, label: 'Voice Comms', icon: 'fa-headset', provider: 'gemini' },
    { id: AppView.VISION, label: 'Intel Scan', icon: 'fa-crosshairs', provider: 'gemini' },
    { id: AppView.SECURITY, label: 'Security Hub', icon: 'fa-lock', provider: 'gemini' },
  ];

  const groqPercent = (quota?.groq?.tokens) ? Math.min(Math.round((quota.groq.tokens / 30000) * 100), 100) : 100;
  const geminiLimit = quota?.gemini?.limit || 15;
  const geminiCount = quota?.gemini?.count || 0;
  const geminiPercent = Math.max(Math.round(((geminiLimit - geminiCount) / geminiLimit) * 100), 0);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={toggleOpen}
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#050508] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-72 md:w-80' : '-translate-x-full md:translate-x-0 md:w-20'}
      `}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-[#76b900] flex items-center justify-center text-black shadow-[0_0_20px_rgba(118,185,0,0.3)] shrink-0">
              <i className="fa-solid fa-ghost text-xl animate-pulse"></i>
            </div>
            {isOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="orbitron font-black text-xl tracking-tighter italic text-white leading-none">ATLAS<span className="text-[#76b900]">_X</span></span>
                <span className="text-[7px] font-bold text-[#76b900]/40 tracking-[0.5em] uppercase mt-1">NVIDIA_LOGIC_CORE</span>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="px-4 py-2 space-y-2 shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              onClick={() => {
                onNewSession();
                if (window.innerWidth < 768) toggleOpen();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group active:scale-95"
            >
              <i className="fa-solid fa-plus text-xs text-[#00f3ff]"></i>
              <span className="text-xs orbitron font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">
                New Session
              </span>
            </button>
          </div>
        )}

        <div className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar pt-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isGroq = item.provider === 'groq';
              const activeColor = isGroq ? '#76b900' : '#00f3ff';
              const meterPercent = isGroq ? groqPercent : geminiPercent;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 768) toggleOpen();
                  }}
                  className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden ${currentView === item.id
                    ? 'bg-white/5 text-white shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {currentView === item.id && (
                    <div style={{ backgroundColor: activeColor }} className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full shadow-[0_0_10px_currentColor]"></div>
                  )}

                  <div
                    style={{ color: currentView === item.id ? activeColor : 'inherit' }}
                    className={`w-5 flex justify-center text-lg transition-transform group-hover:scale-125 ${currentView === item.id ? 'opacity-100 drop-shadow-[0_0_8px_currentColor]' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100'
                      }`}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>

                  {isOpen && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className={`text-[10px] orbitron font-bold uppercase tracking-[0.2em] truncate mr-2 ${currentView === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-200'}`}>
                        {item.label}
                      </span>

                      <div className="flex flex-col items-end gap-0.5">
                        <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                          <div
                            style={{ width: `${meterPercent}%`, backgroundColor: activeColor }}
                            className="h-full shadow-[0_0_5px_currentColor] transition-all duration-1000"
                          ></div>
                        </div>
                        <span className="text-[6px] font-mono opacity-50 text-gray-400">{meterPercent}%</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/5 p-4 bg-black/40 shrink-0">
          {isOpen && user && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-black border border-indigo-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                  <span className="text-[#00f3ff]">99%</span>
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00f3ff] w-[99%] shadow-[0_0_5px_#00f3ff]"></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {isOpen && (
              <button onClick={() => onViewChange(AppView.SETTINGS)} className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-white transition-colors group">
                <i className="fa-solid fa-gear text-xs group-hover:text-[#76b900]"></i>
                <span className="text-[9px] orbitron font-bold uppercase tracking-widest group-hover:text-[#76b900]">Config</span>
              </button>
            )}

            <div className="flex items-center justify-between px-2">
              <button onClick={toggleOpen} className="p-2 text-gray-500 hover:text-[#76b900] transition-colors">
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
                <span className="w-1.5 h-1.5 bg-[#76b900] rounded-full animate-pulse"></span>
                <span className="text-[8px] font-mono text-[#76b900] uppercase tracking-widest">Net Link: Stable</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
