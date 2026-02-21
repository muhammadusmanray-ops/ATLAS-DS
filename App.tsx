import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { AppView, Message, User, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import TacticalAssistant from './components/TacticalAssistant';
import { db } from './services/storage';
import { llmAdapter } from './services/llm';
import { authService } from './services/authService';

// MISSION CRITICAL: Standard Load for core stability
import Dashboard from './components/Dashboard';
import ChatView from './components/ChatView';
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
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (e) {
        console.error("DIAGNOSTIC_INTERRUPT:", e);
        setIsAuthenticated(false);
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

  // EMERGENCY DIAGNOSTIC: Trigger if stuck on black screen
  if (!isAuthenticated && !user && window.location.search.includes('error')) {
    return (
      <div className="h-screen bg-[#050000] flex flex-col items-center justify-center p-10 text-center">
        <i className="fa-solid fa-triangle-exclamation text-red-500 text-5xl mb-6 shadow-2xl"></i>
        <h2 className="text-white orbitron font-black text-xl mb-4 tracking-widest uppercase">Protocol_Failure</h2>
        <p className="text-red-500/80 font-mono text-[11px] max-w-md uppercase leading-relaxed tracking-wider">
          Reason: The neural bridge with Supabase could not be established.
          <br /><br />
          Action: Verify Vercel Environment Variables (URL/KEY) or check network link.
        </p>
        <button onClick={() => window.location.reload()} className="mt-10 px-8 py-3 bg-white text-black orbitron font-black text-[10px] rounded-lg">REBOOT_SYSTEM</button>
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
    <div className="h-screen w-screen flex bg-[#020203] text-gray-100 selection:bg-[#76b900] selection:text-black font-sans overflow-hidden">
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
      />

      <main className={`flex-1 flex flex-col relative transition-all duration-300 ease-in-out min-w-0 ${isSidebarOpen ? 'md:pl-80' : 'md:pl-20'} overflow-hidden`}>
        {/* Mobile Sidebar Overlay Shift */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Global HUD Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050508]/80 backdrop-blur-md z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[12px] orbitron font-black text-white/40 tracking-[0.5em] uppercase leading-none">Sector</span>
              <span className="text-sm orbitron font-black text-white tracking-widest uppercase mt-1">{currentView.replace('_', ' ')}</span>
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
                <img src={user.avatar} className="w-9 h-9 rounded-xl border border-white/10 shadow-lg" alt="Commander" />
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 relative z-10 w-full overflow-y-auto custom-scrollbar">
          <Suspense fallback={GlobalSectorFallback}>
            {currentView === AppView.DASHBOARD && <Dashboard onViewChange={setCurrentView} />}
            {currentView === AppView.CHAT && <ChatView messages={messages} setMessages={setMessages} />}
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
          </Suspense>
          <TacticalAssistant currentView={currentView} />
        </div>
      </main>
    </div>
  );
};

export default App;
