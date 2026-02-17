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
      // Result could be the user OR a signal for verification
      if (result && result.needsVerification) {
        setStep(AuthState.OTP_VERIFY);
      } else if (result) {
        onLogin(result);
      }
    } catch (err: any) {
      // If the service throws, we check if it was a 403 hidden in the error
      if (err.message && err.message.includes('not verified')) {
        setStep(AuthState.OTP_VERIFY);
      } else {
        setError(err.message || 'Authentication Failed');
      }
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

  if (step === AuthState.WELCOME || step === AuthState.EMAIL_INPUT) {
    return (
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white orbitron tracking-widest uppercase">Commander Login</h1>
          <p className="text-slate-400 text-[10px] orbitron opacity-50 uppercase mt-2">Neural Identity Link required</p>
        </div>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="CORP_EMAIL@SECTOR.COM"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            icon={<i className="fa-solid fa-envelope"></i>}
          />
          <Input
            type="password"
            placeholder="ACCESS_PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<i className="fa-solid fa-lock"></i>}
          />
          {error && <p className="text-red-500 text-[9px] orbitron animate-pulse uppercase">⚠️ {error}</p>}
          <Button type="submit" isLoading={isLoading} className="w-full orbitron font-bold">AUTHENTICATE</Button>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-500 orbitron uppercase mb-2">New to the Sector?</p>
            <button
              type="button"
              onClick={() => setStep(AuthState.PASSWORD_SIGNUP)}
              className="w-full py-2 border border-emerald-500/30 text-emerald-500 text-[10px] orbitron font-bold hover:bg-emerald-500/10 transition-all rounded"
            >
              ENLIST NEW COMMAND
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { throw new Error("ATLAS_SENTRY_TEST_SUCCESSFUL"); }}
            className="opacity-10 hover:opacity-50 transition-opacity text-[7px] text-red-500 orbitron"
          >
            [ SYNC_DIAGNOSTIC_SIGNAL ]
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (step === AuthState.PASSWORD_SIGNUP) {
    return (
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white orbitron tracking-widest uppercase text-emerald-500">New Enlistment</h1>
          <p className="text-slate-400 text-[10px] orbitron opacity-50 uppercase mt-2">Create neural signature for {email || 'SECTOR'}</p>
        </div>
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          {!email && (
            <Input
              type="email"
              placeholder="NEW_IDENTITY_EMAIL@SECTOR.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<i className="fa-solid fa-envelope"></i>}
            />
          )}
          <Input
            type="password"
            placeholder="ACCESS_PASSWORD (MIN 8 CHARS)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<i className="fa-solid fa-lock text-emerald-500"></i>}
          />
          {error && <p className="text-red-500 text-[9px] orbitron animate-pulse uppercase">⚠️ {error}</p>}
          <Button type="submit" isLoading={isLoading} className="w-full orbitron font-bold shadow-lg shadow-emerald-500/20">CONFIRM SIGNATURE</Button>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-500 orbitron uppercase mb-2">Already have an ID?</p>
            <button
              type="button"
              onClick={() => setStep(AuthState.WELCOME)}
              className="w-full py-2 border border-blue-500/30 text-blue-400 text-[10px] orbitron font-bold hover:bg-blue-500/10 transition-all rounded"
            >
              RE-AUTHENTICATE COMMANDER
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return null;
};

export default LoginView;