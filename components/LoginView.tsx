import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Terminal logs for effect
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    addLog("SYSTEM_INIT: SECURE GATEWAY v6.0");
    addLog("AUTH_RELAY: NEON_PERSISTENCE ACTIVE");

    // Initialize Auth Tables if DB is connected
    const initAuth = async () => {
      const config = localStorage.getItem('atlas_active_db_config');
      if (config) {
        try {
          await fetch('/api/auth/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config: JSON.parse(config) })
          });
          addLog("IDENTITY_VAULT: Synchronized with Cloud.");
        } catch (e) {
          console.warn("Auth Init Failed:", e);
        }
      }
    };
    initAuth();
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    addLog(`${mode.toUpperCase()}_ATTEMPT: ${formData.email}`);

    const configStr = localStorage.getItem('atlas_active_db_config');
    const config = configStr ? JSON.parse(configStr) : null;

    try {
      if (mode === 'register') {
        const newUser = {
          id: `usr_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
          config
        };

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        addLog("IDENTITY_CREATED: Welcome Commander.");
        onLogin(newUser as any);
      } else {
        // LOGIN
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password, config })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        addLog("ACCESS_GRANTED: Handshake Complete.");
        onLogin(data.user);
      }
    } catch (err: any) {
      setError(err.message || "PROTOCOL_ERROR: Authentication failed.");
      addLog(`DENIED: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
            <p className="text-[10px] orbitron tracking-[0.2em] text-gray-500 uppercase mt-2">Login to your account</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex mb-8 border-b border-white/10">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 text-[11px] orbitron font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'text-[#00f3ff] border-b-2 border-[#00f3ff]' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 text-[11px] orbitron font-bold uppercase tracking-widest transition-all ${mode === 'register' ? 'text-[#ff00ff] border-b-2 border-[#ff00ff]' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-sm text-white outline-none focus:border-[#ff00ff] transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black border border-white/20 p-3 text-sm text-white outline-none focus:border-[#00f3ff] transition-colors font-mono"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
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
              className={`w-full py-4 mt-2 font-black orbitron text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'login'
                ? 'bg-[#00f3ff] text-black hover:bg-white shadow-[0_0_20px_#00f3ff]'
                : 'bg-[#ff00ff] text-black hover:bg-white shadow-[0_0_20px_#ff00ff]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> LOADING...
                </>
              ) : (
                mode === 'login' ? 'LOGIN NOW' : 'REGISTER NOW'
              )}
            </button>
          </form>

          {/* Guest Bypass */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 w-full">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="text-[8px] orbitron text-gray-600 uppercase tracking-widest">Temporary Access</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>
            <button
              onClick={handleGuestLogin}
              className="text-[10px] orbitron text-gray-500 hover:text-[#00f3ff] transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <i className="fa-solid fa-user-secret"></i> Continue as Guest (2 Mins)
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