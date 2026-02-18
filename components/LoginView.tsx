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
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let user;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        user = await authService.register(email, password);
      }
      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white orbitron tracking-widest uppercase">
          {isLogin ? 'Commander Login' : 'New Enlistment'}
        </h1>
        <p className="text-slate-400 text-[10px] orbitron opacity-50 uppercase mt-2">
          {isLogin ? 'Neural Identity Link Required' : 'Register your neural signature'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="COMMANDER_EMAIL@SECTOR.COM"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<i className="fa-solid fa-envelope"></i>}
          required
        />
        <Input
          type="password"
          placeholder="ACCESS_PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<i className="fa-solid fa-lock"></i>}
          required
        />

        {error && (
          <p className="text-red-500 text-[9px] orbitron animate-pulse uppercase">
            ⚠️ {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full orbitron font-bold">
          {isLogin ? 'AUTHENTICATE' : 'ENLIST NOW'}
        </Button>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 orbitron uppercase mb-2">
            {isLogin ? 'New to the Sector?' : 'Already have an ID?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="w-full py-2 border border-white/10 text-white/60 text-[10px] orbitron font-bold hover:bg-white/5 transition-all rounded"
          >
            {isLogin ? 'ENLIST NEW COMMAND' : 'BACK TO LOGIN'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginView;