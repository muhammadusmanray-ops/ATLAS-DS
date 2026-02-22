import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { AppView, Message, User, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import TacticalAssistant from './components/TacticalAssistant';
import { UIAdjuster, UIConfig } from './components/UIAdjuster';
import { db } from './services/storage';
import { llmAdapter } from './services/llm';
import { authService } from './services/authService';

// MISSION CRITICAL: Standard Load for core stability
import Dashboard from './components/Dashboard';
import TacticalCore from './components/TacticalCore';
import SettingsView from './components/SettingsView';
import SecurityView from './components/SecurityView';

// AUXILIARY SECTORS: Lazy Load for performance optimization
const VoiceLive = lazy(() => import('./components/VoiceLive'));
const DataCleaner = lazy(() => import('./components/DataCleaner'));
const VisionView = lazy(() => import('./components/VisionView'));
const GroundingView = lazy(() => import('./components/GroundingView'));
const ModelArchitect = lazy(() => import('./components/ModelArchitect'));
const SyntheticGenerator = lazy(() => import('./components/SyntheticGenerator'));
const AutoEDA = lazy(() => import('./components/AutoEDA'));
const DevOpsHub = lazy(() => import('./components/DevOpsHub'));
const NotebookView = lazy(() => import('./components/NotebookView'));
const AutoML = lazy(() => import('./components/AutoML'));
const KaggleHub = lazy(() => import('./components/KaggleHub'));
const CareerOps = lazy(() => import('./components/CareerOps'));
const DeepResearch = lazy(() => import('./components/DeepResearch'));

// CRITICAL SECTOR: Eager load for immediate identity verification
import LoginView from './components/LoginView';

const App: React.FC = () => {
  // PURE INTERFACE MODE: Auth Bypassed by default
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [uiConfig, setUiConfig] = useState<UIConfig>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('ATLAS_UI_CONFIG') : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("STORAGE_LINK_FAILED: Using default protocols.");
    }
    return {
      chatInputBottom: 40,
      sidebarWidth: 320,
      sidebarScroll: true,
      dashboardScroll: true,
      glassOpacity: 0.8,
      accentColor: '#76b900'
    };
  });

  const defaultMessage: Message = useMemo(() => ({
    role: 'model',
    content: "CORE_SYSTEMS: ACTIVE. Tactical Intelligence Node Atlas-X initialized. Monitoring and Logic clusters operational.",
    type: 'text',
    timestamp: new Date()
  }), []);

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [blueprintData, setBlueprintData] = useState<{ description: string; target: string } | null>(null);

  const handleNavigateToAutoML = (data: { description: string; target: string }) => {
    setBlueprintData(data);
    setCurrentView(AppView.AUTOML);
  };

  const createNewSession = async (view: AppView) => {
    const newId = crypto.randomUUID();
    const title = `Mission ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    await db.createSession(newId, view, title, user?.id);

    const newSession: ChatSession = {
      id: newId,
      moduleId: view,
      title,
      userId: user?.id,
      lastUpdated: new Date(),
      preview: 'New Mission Initialized...'
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([defaultMessage]);
  };

  const handleSelectSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.moduleId !== currentView) {
      if (Object.values(AppView).includes(session.moduleId as AppView)) {
        setCurrentView(session.moduleId as AppView);
      }
    }

    setCurrentSessionId(sessionId);
    const msgs = await db.getChatHistory(sessionId);
    setMessages(msgs.length > 0 ? msgs : [defaultMessage]);

    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  useEffect(() => {
    const initSystem = async () => {
      try {
        await db.init();
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // IFRAME COMPATIBILITY: If in a development iframe and auth fails, provide guest bypass
          const isInIframe = window.self !== window.top;
          if (isInIframe) {
            console.warn("IFRAME_PROTOCOL: Detected. Activating Guest Bypass to prevent 403.");
            const guestUser: User = {
              id: 'guest',
              name: 'Commander Guest',
              email: 'guest@atlas-x.ai',
              rank: 'Commander',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usman&backgroundColor=020203',
              verified: true
            };
            setUser(guestUser);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (e: any) {
        console.error("DIAGNOSTIC_INTERRUPT:", e);
        // Handle common 403/Forbidden errors by allowing guest access in preview
        if (window.self !== window.top) {
          const guestUser: User = {
            id: 'guest',
            name: 'Commander Guest',
            email: 'guest@atlas-x.ai',
            rank: 'Commander',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usman&backgroundColor=020203',
            verified: true
          };
          setUser(guestUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    initSystem();
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadModuleContext = async () => {
      const ignoreHistory = [AppView.DASHBOARD, AppView.SETTINGS, AppView.SECURITY];
      if (ignoreHistory.includes(currentView)) {
        setSessions([]);
        setCurrentSessionId(null);
        return;
      }

      const allSessions = await db.getAllSessions(user?.id);
      setSessions(allSessions);

      const currentViewSessions = allSessions.filter(s => s.moduleId === currentView);
      if (currentViewSessions.length > 0) {
        if (!currentSessionId || !allSessions.find(s => s.id === currentSessionId && s.moduleId === currentView)) {
          handleSelectSession(currentViewSessions[0].id);
        }
      } else {
        await createNewSession(currentView);
      }
    };
    loadModuleContext();
  }, [currentView, user, isAuthenticated]);

  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      db.saveChatHistory(currentSessionId, messages);
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'model') {
        const previewText = lastMsg.content.substring(0, 40) + '...';
        db.updateSessionPreview(currentSessionId, previewText);
        setSessions(prev => prev.map(s =>
          s.id === currentSessionId
            ? { ...s, preview: previewText, lastUpdated: new Date() }
            : s
        ).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()));
      }
    }
  }, [messages, currentSessionId]);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(authenticatedUser));
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(updatedUser));
    await db.saveUser(updatedUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('ATLAS_USER_SESSION');
    localStorage.removeItem('ATLAS_TOKEN');
    window.location.reload();
  };

  const handleDeleteSession = async (id: string) => {
    await db.deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([defaultMessage]);
    }
  };

  const handleRenameSession = async (id: string, title: string) => {
    await db.renameSession(id, title);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title, lastUpdated: new Date() } : s));
  };

  const handleClearChat = async () => {
    const resetMsg = [{ ...defaultMessage, content: `ATLAS_MODULE_${currentView.toUpperCase()}: MEMORY PURGED.` }];
    setMessages(resetMsg);
    if (currentSessionId) await db.saveChatHistory(currentSessionId, resetMsg);
  };

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleNewSession = () => {
    createNewSession(currentView);
  };

  if (isLoading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-[#76b900] orbitron text-[10px] tracking-[0.5em] uppercase">
      <div className="w-10 h-10 border-2 border-t-[#76b900] border-transparent rounded-full animate-spin mb-8 shadow-[0_0_20px_#76b900]"></div>
      <div className="flex flex-col items-center gap-2">
        <p className="animate-pulse">Initializing_Atlas_Kernel...</p>
        <span className="text-[8px] text-white/20 tracking-widest mt-4">Security Handshake in Progress</span>
      </div>
    </div>
  );

  // EMERGENCY DIAGNOSTIC: Trigger if stuck on black screen due to missing keys
  const isMissingKeys = !import.meta.env.VITE_SUPABASE_URL || (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON);

  console.log("ATLAS_SYSTEM_PROBE:", { auth: isAuthenticated, keys: !isMissingKeys });

  if (!isAuthenticated && !user && (window.location.search.includes('error') || isMissingKeys)) {
    return (
      <div className="h-screen bg-[#050000] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 animate-pulse opacity-20"></div>
        <i className="fa-solid fa-triangle-exclamation text-red-500 text-6xl mb-8 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-bounce"></i>
        <h2 className="text-white orbitron font-black text-2xl mb-4 tracking-[0.3em] uppercase italic">System_Protocol_Failure</h2>

        <div className="bg-white/5 border border-red-500/20 p-8 rounded-[2rem] backdrop-blur-3xl max-w-lg space-y-6">
          <p className="text-red-500 font-black orbitron text-[12px] uppercase tracking-widest">Diagnostic: Missing Neural Coordinates</p>
          <p className="text-gray-400 font-mono text-[11px] uppercase leading-relaxed tracking-wider">
            Commander, the application is unable to bridge with the Supabase Neural Core. This usually happens when Environment Variables are missing in the Deployment Sector.
          </p>
          <div className="p-4 bg-black/60 rounded-xl border border-white/5 text-left space-y-2">
            <p className="text-[#76b900] font-black text-[9px] orbitron uppercase tracking-widest">Required Parameters:</p>
            <ul className="text-[9px] font-mono text-gray-500 space-y-1">
              <li>■ VITE_SUPABASE_URL</li>
              <li>■ VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
          <p className="text-gray-500 font-bold text-[9px] uppercase tracking-[0.2em] italic">
            Action: Access Vercel Project Settings &gt; Environment Variables and add these keys.
          </p>
        </div>

        <button onClick={() => window.location.reload()} className="mt-10 px-10 py-4 bg-white text-black orbitron font-black text-[10px] tracking-[0.3em] rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-2xl">
          RETRY_NEURAL_LINK
        </button>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginView onLogin={handleLogin} />;

  const GlobalSectorFallback = (
    <div className="h-full w-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm gap-4">
      <div className="w-8 h-8 border-2 border-t-[#76b900] border-transparent rounded-full animate-spin"></div>
      <p className="orbitron text-[9px] text-[#76b900] tracking-[0.3em] uppercase animate-pulse">Synchronizing_Sector...</p>
    </div>
  );

  return (
    <div className="h-[100dvh] w-screen flex bg-[#020203] text-gray-100 selection:bg-[#76b900] selection:text-black font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        onViewChange={handleViewChange}
        user={user}
        onLogout={handleLogout}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        uiConfig={uiConfig}
      />

      <main className={`flex-1 flex flex-col relative transition-all duration-300 ease-in-out min-w-0 ${isSidebarOpen ? 'md:pl-0' : 'md:pl-0'} min-h-0 overflow-hidden`}>
        {/* Mobile Sidebar Overlay Shift */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Global HUD Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#050508]/80 backdrop-blur-md z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            {/* MOBILE TERMINAL TRIGGER */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-[#76b900] active:scale-95 transition-all shadow-lg"
            >
              <i className="fa-solid fa-bars-staggered text-lg"></i>
            </button>

            <div className="flex flex-col">
              <span className="text-[10px] md:text-[12px] orbitron font-black text-white/40 tracking-[0.5em] uppercase leading-none">Sector</span>
              <span className="text-xs md:text-sm orbitron font-black text-white tracking-widest uppercase mt-1 truncate max-w-[120px] md:max-w-none">{currentView.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView(AppView.SETTINGS)} className="text-xs orbitron font-black text-gray-400 hover:text-[#76b900] transition-all flex items-center gap-2 group">
              <i className="fa-solid fa-gear group-hover:rotate-90 transition-transform"></i> SETTINGS
            </button>
            {user && (
              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] orbitron font-black text-white leading-none uppercase">{user.name}</p>
                  <p className="text-[8px] orbitron text-[#76b900] font-bold mt-1 tracking-widest uppercase">{user.rank}</p>
                </div>
                <div className="w-10 h-10 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-[#050508] overflow-hidden flex items-center justify-center flex-shrink-0 relative group/avatar">
                  {user.avatar ? (
                    <>
                      <img src={user.avatar} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500" alt="Commander" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                    </>
                  ) : (
                    <span className="text-xs orbitron font-black text-[#76b900] tracking-tighter">{user.name?.[0] || 'C'}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 relative z-10 w-full flex flex-col overflow-hidden min-h-0 bg-[#020204]">
          {/* Ambient Perspective Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.08]">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#76b900] blur-[150px] rounded-full animate-pulse transition-all duration-[10s]"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-white blur-[150px] rounded-full animate-pulse [animation-delay:5s]"></div>
          </div>

          <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
            <div className="flex-1 w-full max-w-[1700px] h-full flex flex-col transition-all duration-300">
              <Suspense fallback={GlobalSectorFallback}>
                {currentView === AppView.DASHBOARD && <Dashboard onViewChange={setCurrentView} uiConfig={uiConfig} />}
                {/* SYNC_PROTOCOL: Tactical Core Prop Alignment Active */}
                {currentView === AppView.CHAT && <TacticalCore messages={messages} setMessages={setMessages} uiConfig={uiConfig} />}
                {currentView === AppView.SETTINGS && <SettingsView user={user} onUpdateUser={handleUpdateUser} onClearChat={handleClearChat} />}
                {currentView === AppView.SECURITY && <SecurityView />}
                {currentView === AppView.NOTEBOOK && <NotebookView />}
                {currentView === AppView.AUTOML && <AutoML blueprintData={blueprintData} />}
                {currentView === AppView.KAGGLE_HUB && <KaggleHub />}
                {currentView === AppView.CAREER && <CareerOps />}
                {currentView === AppView.LIVE && <VoiceLive sessionId={currentSessionId} user={user} setGlobalMessages={setMessages} />}
                {currentView === AppView.DATA_CLEANER && <DataCleaner />}
                {currentView === AppView.VISION && <VisionView />}
                {currentView === AppView.GROUNDING && <GroundingView />}
                {currentView === AppView.ARCHITECT && <ModelArchitect onNavigateToAutoML={handleNavigateToAutoML} />}
                {currentView === AppView.SYNTHETIC && <SyntheticGenerator />}
                {currentView === AppView.AUTO_EDA && <AutoEDA />}
                {currentView === AppView.DEVOPS && <DevOpsHub />}
                {currentView === AppView.DEEP_RESEARCH && <DeepResearch />}
                {currentView === AppView.DESIGNER && (
                  <UIAdjuster
                    config={uiConfig}
                    onChange={setUiConfig}
                    onFix={() => {
                      localStorage.setItem('ATLAS_UI_CONFIG', JSON.stringify(uiConfig));
                      setCurrentView(AppView.DASHBOARD);
                    }}
                  />
                )}
              </Suspense>
            </div>
          </div>
          <TacticalAssistant currentView={currentView} />

          {/* THE GHOST BACKGROUND - M U RAY MASTERBRAND */}
          <div className="fixed -bottom-40 -right-40 opacity-[0.03] pointer-events-none z-0 hover:opacity-[0.1] transition-opacity duration-1000 rotate-12 group">
            <i className="fa-solid fa-ghost text-[800px] text-white"></i>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="orbitron text-[40px] font-black text-white/5 tracking-[2em] ml-[1em]">ATLAS_X</p>
              <p className="orbitron text-[10px] font-black text-[#76b900]/10 tracking-[1em] mt-4">NVIDIA_NEURAL_STATION</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
