import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { AuthLayout } from './auth/AuthComponents';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await authService.loginWithGoogle();
    } catch (err: any) {
      console.error("AUTH_ERROR:", err);
      setError(err.message || 'Identity link failed');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="relative p-1">
        {/* Robotic Frame Elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50"></div>

        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <span className="text-[10px] orbitron font-black text-emerald-500 tracking-[0.3em] uppercase">
              Identity Sector 0-1
            </span>
          </div>
          <h1 className="text-3xl font-black text-white orbitron tracking-[0.2em] mb-2 uppercase italic">
            ATLAS<span className="text-emerald-500">_OS</span>
          </h1>
          <p className="text-gray-500 text-[10px] orbitron uppercase tracking-[0.4em] font-bold">
            Neural Link Required
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <p className="text-[10px] text-gray-400 orbitron text-center mb-8 uppercase tracking-widest leading-relaxed">
              Authenticate via global <br />
              <span className="text-white font-black">Google Identity Protocol</span>
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 group/btn relative overflow-hidden ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500 hover:text-white shadow-[0_10px_40px_rgba(255,255,255,0.1)]'}`}
            >
              <div className="relative z-10 flex items-center gap-4">
                {isLoading ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="G" />
                    <span className="orbitron font-black text-[11px] uppercase tracking-[0.2em]">Identify Me</span>
                  </>
                )}
              </div>
            </button>

            {/* PREVIEW BYPASS - FOR IFRAMES */}
            <div className="mt-4">
              <button
                onClick={() => onLogin({
                  id: 'preview-user',
                  name: 'Preview Commander',
                  email: 'preview@atlas-x.ai',
                  rank: 'Commander',
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=preview',
                  verified: true
                })}
                className="w-full py-2 border border-white/5 rounded-xl text-[8px] orbitron text-gray-600 hover:text-gray-300 hover:border-white/10 transition-all uppercase tracking-widest"
              >
                Access via Tactical Bypass (Preview Mode)
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                <p className="text-red-500 text-[9px] orbitron font-black text-center uppercase tracking-widest">
                  ⚠️ Error: {error}
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] text-gray-600 orbitron uppercase tracking-[0.5em]">System Status: Ready</span>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginView;