import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Terminal logs for effect
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    addLog("SYSTEM_INIT: SECURE GATEWAY v6.5");
    addLog("AUTH_RELAY: DISPATCHER_VERIFIED");
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    addLog(`${mode.toUpperCase()}_ATTEMPT: ${formData.email}`);

    try {
      if (mode === 'verify') {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: formData.code })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        addLog("VERIFICATION_SUCCESS: Access Ready.");
        localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(data.user));
        onLogin(data.user);
        return;
      }

      // LOGIN / REGISTER
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avatar: mode === 'register' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}` : undefined
        })
      });

      const data = await res.json();

      if (res.status === 403 && data.needsVerification) {
        addLog("PROTOCOL_HOLD: Email Verification Required.");
        setMode('verify');
        setError('');
        return;
      }

      if (!data.success) throw new Error(data.error);

      if (mode === 'register' && data.needsVerification) {
        addLog("DISPATCHED: Security code sent to inbox.");
        setMode('verify');
        return;
      }

      addLog("ACCESS_GRANTED: Handshake Complete.");
      // 🛡️ SESSION PERSISTED ONLY ON SUCCESS
      localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(data.user));
      onLogin(data.user);

    } catch (err: any) {
      setError(err.message || "PROTOCOL_ERROR: Failed.");
      addLog(`DENIED: Security protocols active.`);
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

          {/* Toggle Tabs - Tactical Onboarding */}
          <div className="flex mb-8 border-b border-white/10">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 text-[10px] orbitron font-black uppercase tracking-[0.3em] transition-all relative ${mode === 'login' || mode === 'verify' ? 'text-[#00f3ff]' : 'text-gray-600 hover:text-gray-400'}`}
            >
              SECURE GATEWAY
              {(mode === 'login' || mode === 'verify') && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]"></div>}
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 text-[10px] orbitron font-black uppercase tracking-[0.3em] transition-all relative ${mode === 'register' ? 'text-[#ff00ff]' : 'text-gray-600 hover:text-gray-400'}`}
            >
              ONBOARD NODE
              {mode === 'register' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff00ff] shadow-[0_0_10px_#ff00ff]"></div>}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'verify' ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="text-center py-2">
                  <div className="w-10 h-10 bg-[#00f3ff]/10 rounded border border-[#00f3ff]/30 flex items-center justify-center mx-auto mb-2">
                    <i className="fa-solid fa-envelope-open-text text-[#00f3ff] text-sm"></i>
                  </div>
                  <h3 className="orbitron text-[10px] text-white font-bold tracking-[0.2em] uppercase">Protocol Cipher Required</h3>
                  <p className="text-[9px] text-gray-500 mt-1">Check <span className="text-[#00f3ff] font-mono">{formData.email}</span> for handshake code.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest text-[#00f3ff]">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-black border border-[#00f3ff]/40 p-4 text-center text-2xl tracking-[15px] font-mono text-[#00f3ff] outline-none focus:border-[#00f3ff] transition-all shadow-[inset_0_0_15px_rgba(0,243,255,0.1)]"
                    placeholder="000000"
                  />
                </div>
              </div>
            ) : (
              <>
                {mode === 'register' && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                    <label className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest">Call Sign / Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black border border-white/20 p-3 text-sm text-white outline-none focus:border-[#ff00ff] transition-colors"
                      placeholder="Enter identity"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest">Identity Node (Email)</label>
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
                  <label className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest">Security Key (Password)</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-sm text-white outline-none focus:border-[#00f3ff] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 font-black orbitron text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'login'
                ? 'bg-[#00f3ff] text-black hover:bg-white shadow-[0_0_20px_#00f3ff]'
                : mode === 'register' ? 'bg-[#ff00ff] text-black hover:bg-white shadow-[0_0_20px_#ff00ff]'
                  : 'bg-white text-black hover:bg-[#00f3ff] shadow-[0_0_20px_white]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> INITIALIZING...
                </>
              ) : (
                mode === 'login' ? 'ACCESS GATEWAY' : (mode === 'register' ? 'ONBOARD NODE' : 'VERIFY & UNLOCK')
              )}
            </button>

            {mode === 'verify' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-[10px] orbitron text-gray-500 hover:text-[#00f3ff] transition-colors uppercase tracking-[0.2em] pt-2"
              >
                Abort Protocol
              </button>
            )}
          </form>

          {/* Guest Sector - Simplified */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
            <button
              onClick={handleGuestLogin}
              className="text-[9px] orbitron text-gray-500 hover:text-[#00f3ff] transition-all flex items-center gap-2 uppercase tracking-[0.3em] bg-white/5 px-6 py-2 border border-white/5 hover:border-[#00f3ff]/30"
            >
              <i className="fa-solid fa-user-secret"></i> Guest Access
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