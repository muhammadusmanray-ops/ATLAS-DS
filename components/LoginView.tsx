import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User } from '../types';
import { authService } from '../services/authService';
import { AuthLayout } from './auth/AuthComponents';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await authService.login(email, password);
        if (user) onLogin(user);
      } else {
        await authService.register(email, password);
        // Direct Login: User identity established via Secure Handshake
        const user = await authService.login(email, password);
        if (user) onLogin(user);
      }
    } catch (err: any) {
      console.error("AUTH_ERROR_LOG:", err);
      // Detailed error for Commander troubleshooting
      const errorMessage = err.message || 'Authentication error';
      if (errorMessage.includes('not authorized') || errorMessage.includes('Invalid login')) {
        setError('STRIKE_FAILED: Invalid Credentials or Unverified Sector.');
      } else {
        setError(`SYSTEM_HALT: ${errorMessage.toUpperCase()}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white orbitron tracking-widest uppercase mb-1">
          ATLAS OS
        </h1>
        <p className="text-emerald-500 text-[10px] orbitron font-bold uppercase tracking-tighter">
          {isLogin ? 'Commander Identity Required' : 'Initialize New Command'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="USER@SECTOR.COM"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="ACCESS_KEY"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-[9px] orbitron animate-pulse uppercase">
            ⚠️ {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full orbitron font-bold">
          {isLogin ? 'AUTHENTICATE' : 'DEPLOY IDENTITY'}
        </Button>

        {isLogin && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase">
              <span className="bg-[#0a0a0c] px-2 text-gray-500 orbitron">Secure Neural Bridge</span>
            </div>
          </div>
        )}

        {isLogin && (
          <button
            type="button"
            onClick={async () => {
              try {
                setIsLoading(true);
                await authService.loginWithGoogle();
              } catch (err: any) {
                setError(err.message);
                setIsLoading(false);
              }
            }}
            className="w-full py-2.5 bg-white text-black text-[10px] orbitron font-black rounded flex items-center justify-center gap-3 hover:bg-gray-200 transition-all uppercase tracking-widest"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
            Continue with Google
          </button>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 orbitron uppercase mb-2">
            Switch Protocol?
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="w-full py-2 border border-white/10 text-white/40 text-[9px] orbitron font-bold hover:bg-white/5 transition-all rounded"
          >
            {isLogin ? 'NEW ENLISTMENT' : 'BACK TO LOGIN'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginView;