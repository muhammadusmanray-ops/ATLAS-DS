import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { AppView, Message, User, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import TacticalAssistant from './components/TacticalAssistant';
import { db } from './services/storage';
import { llmAdapter } from './services/llm';

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
const LoginView = lazy(() => import('./components/LoginView'));

const App: React.FC = () => {
  // PURE INTERFACE MODE: Auth Bypassed by default
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<User | null>({
    id: 'GUEST_COMMANDER',
    name: 'COMMANDER_USMAN',
    email: 'atlas.commander@sector.local',
    rank: 'Commander',
    verified: true,
    provider: 'local',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usman'
  });

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
        // Interface-Only Mode: Load user data from local storage if specifically saved, else use mock
        const savedUser = localStorage.getItem('ATLAS_USER_SESSION');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("DIAGNOSTIC_INTERRUPT:", e);
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

  const handleLogout = () => {
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

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-[#76b900] orbitron text-xs tracking-widest">INITIALIZING_SYSTEM...</div>;

  if (!isAuthenticated) return <Suspense fallback={null}><LoginView onLogin={handleLogin} /></Suspense>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#020203] text-gray-100 selection:bg-[#76b900] selection:text-black font-sans">
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

      <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden min-w-0">
        {/* Mobile Sidebar Overlay Shift */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Global HUD Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050508]/80 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] orbitron font-black text-white/40 tracking-[0.5em] uppercase">Sector</span>
              <span className="text-xs orbitron font-black text-white tracking-widest uppercase">{currentView.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView(AppView.SETTINGS)} className="text-[10px] orbitron font-black text-gray-500 hover:text-white transition-all flex items-center gap-2 group">
              <i className="fa-solid fa-gear group-hover:rotate-90 transition-transform"></i> SETTINGS
            </button>
            {user && (
              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] orbitron font-black text-white leading-none uppercase">{user.name}</p>
                  <p className="text-[7px] orbitron text-[#76b900] font-bold mt-1 tracking-widest uppercase">{user.rank}</p>
                </div>
                <img src={user.avatar} className="w-8 h-8 rounded-lg border border-white/10" alt="Commander" />
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative z-10 w-full">
          <Suspense fallback={<div className="h-full flex items-center justify-center flex-col gap-4">
            <i className="fa-solid fa-ghost fa-spin text-5xl text-[#76b900]"></i>
            <p className="orbitron text-xs text-[#76b900] animate-pulse tracking-widest font-black uppercase">Synchronizing Sector...</p>
          </div>}>
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
        </div>
        <TacticalAssistant currentView={currentView} />
      </main>
    </div>
  );
};

export default App;
