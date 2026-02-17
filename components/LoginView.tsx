import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AuthState, User } from '../types';
import { authService } from '../services/authService';
import { AuthLayout, Divider } from './auth/AuthComponents';
import { OtpScreen } from './auth/OtpScreen';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthState>(AuthState.WELCOME);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const GOOGLE_CLIENT_ID = "Your_Google_Client_ID"; // User should set this

  // Initialize Google Button
  useEffect(() => {
    if (step === AuthState.WELCOME) {
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(interval);
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleGoogleResponse
            });

            const parent = document.getElementById("googleSignInDiv");
            if (parent) {
              window.google.accounts.id.renderButton(
                parent,
                { theme: "filled_black", size: "large", width: "100%", text: "continue_with" }
              );
            }
          } catch (e) {
            console.error("Google Auth Error:", e);
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    try {
      const user = await authService.googleLogin(response.credential);
      onLogin(user);
    } catch (err: any) {
      setError("Google Login Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Email Submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const exists = await authService.checkUserExists(email);
      if (exists) {
        setStep(AuthState.PASSWORD_LOGIN);
      } else {
        setStep(AuthState.PASSWORD_SIGNUP);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');
    try {
      const result = await authService.login(email, password);
      if (result.needsVerification) {
        setStep(AuthState.OTP_VERIFY);
      } else {
        onLogin(result);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Signup Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const user = await authService.register(email, password);
      // Backend automatically sends OTP and requires verification
      setStep(AuthState.OTP_VERIFY);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: OTP Verification
  const handleOtpVerify = async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      const user = await authService.verifyOtp(email, code);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERERS ---

  if (step === AuthState.OTP_VERIFY) {
    return (
      <OtpScreen
        email={email}
        onVerify={handleOtpVerify}
        onResend={() => authService.register(email, password)}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (step === AuthState.WELCOME) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                onClick={() => setStep(AuthState.EMAIL_INPUT)}
                readOnly
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 p-1.5 rounded-md text-white hover:bg-emerald-500 transition-colors"
                onClick={() => setStep(AuthState.EMAIL_INPUT)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <Divider />
            <div className="w-full flex justify-center">
              <div id="googleSignInDiv" className="w-full h-[44px]"></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-4">
            Don't have an account?
            <button onClick={() => setStep(AuthState.EMAIL_INPUT)} className="text-emerald-500 hover:underline">Sign up</button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (step === AuthState.EMAIL_INPUT) {
    return (
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Get started</h1>
        </div>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            error={error}
          />
          <Button type="submit" isLoading={isLoading} className="w-full">Continue</Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-slate-400">
            Already have an account? <button onClick={() => setStep(AuthState.WELCOME)} className="text-emerald-500 hover:underline">Log in</button>
          </span>
        </div>
      </AuthLayout>
    );
  }

  if (step === AuthState.PASSWORD_LOGIN) {
    return (
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Enter your password</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-sm text-slate-400 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              {email}
            </span>
            <button onClick={() => { setStep(AuthState.EMAIL_INPUT); setPassword(''); setError(''); }} className="text-xs text-emerald-500 hover:underline">Edit</button>
          </div>
        </div>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            error={error}
          />
          <div className="flex justify-end">
            <button type="button" className="text-sm text-emerald-500 hover:underline">Forgot password?</button>
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full">Log in</Button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setStep(AuthState.WELCOME)} className="text-sm text-slate-500 hover:text-slate-300">
            &larr; Back to start
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (step === AuthState.PASSWORD_SIGNUP) {
    return (
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-2">
            Welcome! Please create a password for <br /><span className="text-slate-200">{email}</span>
          </p>
        </div>
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="At least 8 characters"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            error={error}
          />
          <Button type="submit" isLoading={isLoading} className="w-full">Continue</Button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setStep(AuthState.EMAIL_INPUT)} className="text-sm text-slate-500 hover:text-slate-300">
            &larr; Use a different email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return null;
};

export default LoginView;