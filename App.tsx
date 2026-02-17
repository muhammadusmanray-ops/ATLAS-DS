
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

// ... (imports remain)

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ... (state defs)

  useEffect(() => {
    const initSystem = async () => {
      try {
        await db.init();
        const sessionUser = localStorage.getItem('ATLAS_USER_SESSION');

        if (sessionUser) {
          const parsedUser = JSON.parse(sessionUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Auth Check Failed:", e);
      } finally {
        setIsLoading(false); // Done checking
      }
    };
    initSystem();
  }, []);

  // ... (other useEffects)

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(authenticatedUser));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('ATLAS_USER_SESSION');
    window.location.reload(); // Hard reset
  };

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-[#76b900] orbitron">INITIALIZING_SYSTEM...</div>;

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="h-screen bg-black text-[#76b900]">Loading Gateway...</div>}>
        <LoginView onLogin={handleLogin} />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#020203] text-gray-100 selection:bg-[#76b900] selection:text-black font-sans">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        toggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onLogout={handleLogout}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={() => createNewSession(currentView)}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      <main className={`flex-1 flex flex-col relative transition-all duration-500 overflow-hidden ml-0 ${isSidebarOpen ? 'md:ml-80' : 'md:ml-20'}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#76b900 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#76b900]/5 blur-[150px] pointer-events-none rounded-full"></div>

        <header className="h-16 border-b border-white/5 bg-black/40 flex items-center justify-between px-8 z-40 backdrop-blur-2xl">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-[#76b900] hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
              <div className="w-2.5 h-2.5 rounded-full bg-[#76b900] shadow-[0_0_10px_#76b900] animate-pulse"></div>
              <span className="orbitron text-[9px] font-black text-[#76b900] uppercase tracking-[0.4em]">Combat Hub</span>
            </div>
            <div className="hidden md:flex gap-6">
              <div className="flex flex-col">
                <span className="text-[7px] orbitron text-gray-500 uppercase font-bold tracking-widest">Neural Flow</span>
                <div className="w-24 h-1 bg-gray-900 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#76b900] w-[88%] animate-pulse shadow-[0_0_5px_#76b900]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <h1 className="orbitron text-xs font-black tracking-[0.3em] text-white uppercase flex items-center gap-3">
              <i className="fa-solid fa-shield-halved text-[#76b900]"></i>
              {currentView.replace('_', ' ')}
            </h1>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setCurrentView(AppView.SETTINGS)}>
              <div className="flex flex-col items-end">
                <span className="text-[9px] orbitron font-black text-white">{user?.name}</span>
                <span className="text-[7px] orbitron text-[#76b900] tracking-widest uppercase italic font-bold">Lvl 99-Elite</span>
              </div>
              <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usman'} alt="Avatar" className="w-8 h-8 rounded-lg border border-[#76b900]/20 object-cover shadow-[0_0_10px_rgba(118,185,0,0.2)]" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative z-10">
          <Suspense fallback={<div className="h-full flex items-center justify-center flex-col gap-4">
            <i className="fa-solid fa-ghost fa-spin text-5xl text-[#76b900]"></i>
            <p className="orbitron text-[10px] text-[#76b900] animate-pulse tracking-widest font-black">SYNCHRONIZING_SECTOR...</p>
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
