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
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setShowHistory(false)}
                className={`py-2 rounded-lg text-[9px] orbitron font-bold uppercase transition-all ${!showHistory ? 'bg-[#76b900] text-black shadow-lg shadow-[#76b900]/20' : 'text-gray-500 hover:text-white'}`}
              >
                Navigation
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={`py-2 rounded-lg text-[9px] orbitron font-bold uppercase transition-all ${showHistory ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
              >
                Mission Logs
              </button>
            </div>

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
          {isOpen && showHistory ? (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              {sessions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <i className="fa-solid fa-inbox text-4xl text-gray-800 mb-3"></i>
                  <p className="text-gray-600 text-[10px] orbitron font-bold uppercase tracking-widest">No Conversations Yet</p>
                  <p className="text-gray-700 text-[8px] mt-1">Start a new session to begin</p>
                </div>
              ) : (
                (() => {
                  // Group sessions by time
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  const last7Days = new Date(today);
                  last7Days.setDate(last7Days.getDate() - 7);
                  const last30Days = new Date(today);
                  last30Days.setDate(last30Days.getDate() - 30);

                  const grouped = {
                    today: [] as typeof sessions,
                    yesterday: [] as typeof sessions,
                    last7Days: [] as typeof sessions,
                    last30Days: [] as typeof sessions,
                    older: [] as typeof sessions,
                  };

                  sessions.forEach(session => {
                    const sessionDate = new Date(session.lastUpdated);
                    if (sessionDate >= today) {
                      grouped.today.push(session);
                    } else if (sessionDate >= yesterday) {
                      grouped.yesterday.push(session);
                    } else if (sessionDate >= last7Days) {
                      grouped.last7Days.push(session);
                    } else if (sessionDate >= last30Days) {
                      grouped.last30Days.push(session);
                    } else {
                      grouped.older.push(session);
                    }
                  });

                  return (
                    <>
                      {Object.entries(grouped).map(([key, groupSessions]) => {
                        if (groupSessions.length === 0) return null;

                        const labels: Record<string, string> = {
                          today: 'Today',
                          yesterday: 'Yesterday',
                          last7Days: 'Last 7 Days',
                          last30Days: 'Last 30 Days',
                          older: 'Older'
                        };

                        return (
                          <div key={key} className="space-y-1">
                            <div className="px-2 py-1 text-[8px] orbitron text-gray-600 font-black uppercase tracking-[0.3em] sticky top-0 bg-[#050508] z-10">
                              {labels[key]}
                            </div>
                            {groupSessions.map(session => (
                              <div
                                key={session.id}
                                onClick={() => {
                                  onSelectSession(session.id);
                                  if (window.innerWidth < 768) toggleOpen();
                                }}
                                className={`w-full text-left p-3 rounded-xl transition-all group relative cursor-pointer border ${currentSessionId === session.id
                                  ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                  : 'hover:bg-white/5 border-transparent hover:border-white/10'
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${currentSessionId === session.id ? 'bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]' : 'bg-gray-800'}`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-[11px] font-bold truncate tracking-wide ${currentSessionId === session.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                                      }`}>
                                      {session.title}
                                    </p>
                                    <p className="text-[9px] text-gray-600 truncate mt-0.5 orbitron tracking-tight">
                                      {session.preview || 'No transmission data...'}
                                    </p>
                                  </div>

                                  {/* Hover Actions */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newTitle = prompt('Enter new mission title:', session.title);
                                        if (newTitle) onRenameSession(session.id, newTitle);
                                      }}
                                      className="p-1.5 hover:bg-white/10 rounded text-gray-600 hover:text-white transition-all active:scale-90"
                                      title="Rename Mission"
                                    >
                                      <i className="fa-solid fa-pen text-[8px]"></i>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Permanently purge this mission log?')) onDeleteSession(session.id);
                                      }}
                                      className="p-1.5 hover:bg-red-500/20 rounded text-gray-600 hover:text-red-500 transition-all active:scale-90"
                                      title="Purge Mission"
                                    >
                                      <i className="fa-solid fa-trash text-[8px]"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </>
                  );
                })()
              )}
            </div>
          ) : (
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
          )}
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
