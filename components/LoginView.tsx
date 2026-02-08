import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Terminal logs for effect
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    addLog("SYSTEM_INIT: SECURE GATEWAY v4.2");
    addLog("CONNECTION: ENCRYPTED (TLS 1.3)");

    // UX IMPROVEMENT: Check if this is a first-time user
    const existingUsers = localStorage.getItem('ATLAS_USERS');
    if (!existingUsers || JSON.parse(existingUsers).length === 0) {
        setView('register');
        setTimeout(() => {
            addLog("NOTICE: No local identities found.");
            addLog("PROTOCOL: Switched to NEW IDENTITY creation.");
        }, 800);
    } else {
        addLog("DB_CHECK: Local identities found.");
    }
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
  };

  const handleGuestLogin = () => {
    addLog("BYPASS: GUEST PROTOCOL INITIATED...");
    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'guest_001',
        name: 'Visiting Officer',
        email: 'guest@atlas.demo',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        rank: 'Junior Intel',
        verified: false
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      try {
        if (view === 'register') {
          // REAL LOGIC: Check if user exists in LocalStorage
          const existingUsers = JSON.parse(localStorage.getItem('ATLAS_USERS') || '[]');
          if (existingUsers.find((u: any) => u.email === formData.email)) {
            throw new Error("USER_EXISTS: Identity conflict detected.");
          }

          const newUser = {
            id: `usr_${Date.now()}`,
            name: formData.name,
            email: formData.email,
            password: formData.password, // NOTE: In a real backend, verify/hash this!
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
            rank: 'Lead Scientist' as const,
            verified: true
          };

          localStorage.setItem('ATLAS_USERS', JSON.stringify([...existingUsers, newUser]));
          addLog("DB_WRITE: Identity established.");
          addLog("AUTH: Login with new credentials.");
          
          // Auto-login after register
          onLogin(newUser);
        } else {
          // LOGIN LOGIC
          const existingUsers = JSON.parse(localStorage.getItem('ATLAS_USERS') || '[]');
          const user = existingUsers.find((u: any) => u.email === formData.email && u.password === formData.password);

          if (user) {
            addLog("CREDENTIALS_VERIFIED: Access Granted.");
            onLogin(user);
          } else {
            throw new Error("ACCESS_DENIED: Invalid credentials.");
          }
        }
      } catch (err: any) {
        setError(err.message);
        addLog(`ERROR: ${err.message}`);
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
      {/* Background Cyber Effects */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00f3ff] shadow-[0_0_20px_#00f3ff] animate-pulse"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Holographic Card */}
        <div className="bg-black/90 border border-white/10 backdrop-blur-xl p-8 rounded-none shadow-[0_0_60px_rgba(0,243,255,0.05)] relative overflow-hidden">
          
          {/* Animated Borders */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00f3ff]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00f3ff]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00f3ff]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00f3ff]"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <div className="w-12 h-12 bg-[#00f3ff]/10 rounded-full flex items-center justify-center border border-[#00f3ff]/50 animate-pulse">
                 <i className="fa-solid fa-fingerprint text-[#00f3ff] text-xl"></i>
               </div>
            </div>
            <h1 className="orbitron text-3xl font-black text-white italic tracking-tighter">ATLAS<span className="text-[#00f3ff]">X</span></h1>
            <p className="text-[9px] orbitron tracking-[0.4em] text-gray-500 uppercase mt-2">Identity Verification Layer</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex mb-8 border-b border-white/10">
            <button 
              onClick={() => { setView('login'); setError(''); }}
              className={`flex-1 py-3 text-[10px] orbitron font-bold uppercase tracking-widest transition-all ${view === 'login' ? 'text-[#00f3ff] border-b-2 border-[#00f3ff]' : 'text-gray-600 hover:text-gray-400'}`}
            >
              System Login
            </button>
            <button 
              onClick={() => { setView('register'); setError(''); }}
              className={`flex-1 py-3 text-[10px] orbitron font-bold uppercase tracking-widest transition-all ${view === 'register' ? 'text-[#ff00ff] border-b-2 border-[#ff00ff]' : 'text-gray-600 hover:text-gray-400'}`}
            >
              New Identity
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {view === 'register' && (
              <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="text-[9px] orbitron font-bold text-gray-500 uppercase tracking-widest">Operator Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black border border-white/20 p-3 text-sm text-white outline-none focus:border-[#ff00ff] transition-colors"
                  placeholder="e.g. Cmdr. Sarah"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] orbitron font-bold text-gray-500 uppercase tracking-widest">Neural Link Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black border border-white/20 p-3 text-sm text-white outline-none focus:border-[#00f3ff] transition-colors"
                placeholder="agent@atlas.ai"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] orbitron font-bold text-gray-500 uppercase tracking-widest">Passcode</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black border border-white/20 p-3 text-sm text-white outline-none focus:border-[#00f3ff] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 font-black orbitron text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
                view === 'login' 
                  ? 'bg-[#00f3ff] text-black hover:bg-white shadow-[0_0_20px_#00f3ff]' 
                  : 'bg-[#ff00ff] text-black hover:bg-white shadow-[0_0_20px_#ff00ff]'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> PROCESSING...
                </>
              ) : (
                view === 'login' ? 'AUTHENTICATE' : 'INITIALIZE PROTOCOL'
              )}
            </button>
          </form>

          {/* Guest Bypass */}
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 w-full">
                <div className="h-[1px] bg-white/10 flex-1"></div>
                <span className="text-[8px] orbitron text-gray-600 uppercase tracking-widest">Emergency Override</span>
                <div className="h-[1px] bg-white/10 flex-1"></div>
             </div>
             <button 
               onClick={handleGuestLogin}
               className="text-[9px] orbitron text-gray-500 hover:text-[#00f3ff] transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
             >
               <i className="fa-solid fa-user-secret"></i> Access as Guest / Recruiter
             </button>
          </div>

          {/* Terminal Output */}
          <div className="mt-6 bg-black p-3 rounded border border-white/5 font-mono text-[8px] text-gray-500 h-20 overflow-hidden">
             {logs.map((log, i) => (
               <div key={i} className="mb-1">{log}</div>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginView;