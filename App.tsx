
import React, { useState, useEffect } from 'react';
import { AppView, Message, User } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import VoiceLive from './components/VoiceLive';
import DataCleaner from './components/DataCleaner';
import VisionView from './components/VisionView';
import GroundingView from './components/GroundingView';
import ModelArchitect from './components/ModelArchitect';
import SyntheticGenerator from './components/SyntheticGenerator';
import AutoEDA from './components/AutoEDA';
import DevOpsHub from './components/DevOpsHub';
import LoginView from './components/LoginView';
import Dashboard from './components/Dashboard';
import NotebookView from './components/NotebookView';
import AutoML from './components/AutoML';
import KaggleHub from './components/KaggleHub';
import CareerOps from './components/CareerOps';
import SettingsView from './components/SettingsView';
import SecurityView from './components/SecurityView';
import { db } from './services/storage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Default welcome message
  const defaultMessage: Message = {
    role: 'model',
    content: "CORE_SYSTEMS: ACTIVE. Tactical Intelligence Node Atlas-X initialized. 20-year data forensic experience loaded into RAM. Mission objectives identified.",
    type: 'text',
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);

  // Load Session & Chat History on Mount from DB
  useEffect(() => {
    const initSystem = async () => {
        try {
            await db.init(); // Initialize IndexedDB

            // 1. Load User
            const sessionUser = localStorage.getItem('ATLAS_USER_SESSION');
            if (sessionUser) {
                setUser(JSON.parse(sessionUser));
                setIsAuthenticated(true);
            }

            // 2. Load Chat History from IndexedDB (More robust)
            const history = await db.getChatHistory();
            if (history && history.length > 0) {
                setMessages(history);
            }
        } catch (e) {
            console.error("System Initialization Failure:", e);
        }
    };
    initSystem();
  }, []);

  // Persist Chat History to DB whenever it changes
  useEffect(() => {
    if (messages.length > 1) { 
      db.saveChatHistory(messages);
    }
  }, [messages]);

  const handleLogin = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(authenticatedUser));
    await db.saveUser(authenticatedUser); // Backup to DB
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
  };

  const handleClearChat = async () => {
    setMessages([defaultMessage]);
    await db.saveChatHistory([defaultMessage]);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#020203] text-gray-100 selection:bg-[#00f3ff] selection:text-black">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        toggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col relative transition-all duration-500 overflow-hidden">
        {/* Futuristic Grid & Ambient Glows */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00f3ff]/5 blur-[150px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] pointer-events-none rounded-full"></div>

        <header className="h-16 border-b border-white/5 bg-black/40 flex items-center justify-between px-8 z-40 backdrop-blur-2xl">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] animate-pulse"></div>
                <span className="orbitron text-[9px] font-black text-[#00f3ff] uppercase tracking-[0.4em]">Combat Hub</span>
            </div>
            
            <div className="hidden md:flex gap-6">
                <div className="flex flex-col">
                    <span className="text-[7px] orbitron text-gray-500 uppercase font-bold tracking-widest">System Load</span>
                    <div className="w-24 h-1 bg-gray-900 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[45%] animate-pulse"></div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] orbitron text-gray-500 uppercase font-bold tracking-widest">Neural Flow</span>
                    <div className="w-24 h-1 bg-gray-900 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-red-500 w-[72%] animate-pulse"></div>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <h1 className="orbitron text-xs font-black tracking-[0.3em] text-white uppercase flex items-center gap-3 group">
              <i className="fa-solid fa-shield-halved text-[#00f3ff] group-hover:rotate-12 transition-transform"></i>
              {currentView.replace('_', ' ')}
            </h1>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] orbitron font-black text-white">{user?.name}</span>
                    <span className="text-[7px] orbitron text-[#00f3ff] tracking-widest uppercase">Lvl {user?.rank === 'Commander' ? '99' : '50'}</span>
                </div>
                <div className="w-8 h-8 rounded-lg border border-[#00f3ff]/20 bg-[#00f3ff]/5 flex items-center justify-center text-[#00f3ff] overflow-hidden">
                    <img src={user?.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative z-10">
          {currentView === AppView.DASHBOARD && <Dashboard onViewChange={setCurrentView} />}
          {currentView === AppView.CHAT && <ChatView messages={messages} setMessages={setMessages} />}
          {currentView === AppView.NOTEBOOK && <NotebookView />}
          {currentView === AppView.AUTOML && <AutoML />}
          {currentView === AppView.KAGGLE_HUB && <KaggleHub />}
          {currentView === AppView.CAREER && <CareerOps />}
          {currentView === AppView.LIVE && <VoiceLive />}
          {currentView === AppView.DATA_CLEANER && <DataCleaner />}
          {currentView === AppView.VISION && <VisionView />}
          {currentView === AppView.GROUNDING && <GroundingView />}
          {currentView === AppView.ARCHITECT && <ModelArchitect />}
          {currentView === AppView.SYNTHETIC && <SyntheticGenerator />}
          {currentView === AppView.AUTO_EDA && <AutoEDA />}
          {currentView === AppView.DEVOPS && <DevOpsHub />}
          {currentView === AppView.SETTINGS && (
            <SettingsView 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onClearChat={handleClearChat} 
            />
          )}
          {currentView === AppView.SECURITY && <SecurityView />}
        </div>
      </main>
    </div>
  );
};

export default App;
