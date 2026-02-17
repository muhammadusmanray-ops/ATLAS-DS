import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { db } from '../services/storage';

// --- STYLES & COMPONENTS (Atlas Tactical Theme) ---
// Note: We keep the tactical look but implement the EXACT multi-step logic from your Zip code

const TacticalButton: React.FC<{ onClick?: () => void; children: React.ReactNode; loading?: boolean; type?: "button" | "submit" }> = ({ onClick, children, loading, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="w-full bg-[#00f3ff] hover:bg-[#00d8e6] text-black font-black orbitron text-xs py-4 rounded shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all flex items-center justify-center gap-2 group"
  >
    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : children}
  </button>
);

const TacticalInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string; type?: string; autoFocus?: boolean }> = ({ value, onChange, placeholder, type = "text", autoFocus }) => (
  <input
    type={type}
    autoFocus={autoFocus}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-black/60 border border-[#00f3ff]/20 text-[#00f3ff] px-4 py-4 rounded orbitron text-xs focus:border-[#00f3ff] outline-none transition-all placeholder:text-[#00f3ff]/30 mb-4"
  />
);

// --- MAIN LOGIN VIEW ---
interface LoginViewProps {
  onLogin: (user: User) => void;
}

enum AuthStep {
  WELCOME,
  EMAIL_INPUT,
  PASSWORD_LOGIN,
  PASSWORD_SIGNUP,
  OTP_VERIFY
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>(AuthStep.WELCOME);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Check Email
  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return setError("INVALID_NODE_ADDRESS");

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });
      const data = await res.json();
      if (data.exists) setStep(AuthStep.PASSWORD_LOGIN);
      else setStep(AuthStep.PASSWORD_SIGNUP);
    } catch (err) {
      setError("COMM_LINK_ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Login/Register
  const handleAuth = async (isSignup: boolean) => {
    setIsLoading(true);
    setError('');
    const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      });
      const data = await res.json();

      if (res.status === 403) {
        // Verification Needed
        setStep(AuthStep.OTP_VERIFY);
      } else if (res.ok) {
        if (data.token) localStorage.setItem('ATLAS_TOKEN', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || "ACCESS_DENIED");
      }
    } catch (err) {
      setError("ENCRYPTION_FAIL");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP
  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), code })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) localStorage.setItem('ATLAS_TOKEN', data.token);
        onLogin(data.user);
      } else {
        setError("CODE_INVALID");
      }
    } catch (err) {
      setError("BUFFER_OVERFLOW");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Logic
  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.join('').length === 6) verifyOtp(newOtp.join(''));
  };

  return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="w-full max-w-md bg-black/80 border border-[#00f3ff]/20 backdrop-blur-3xl p-10 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.1)] relative z-10">

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#00f3ff]/10 border border-[#00f3ff] rounded-xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            <i className="fa-solid fa-shield-halved text-2xl text-[#00f3ff]"></i>
          </div>
          <h2 className="orbitron text-lg font-black text-white tracking-[0.2em] uppercase">Tactical Gateway</h2>
          <p className="orbitron text-[9px] text-[#00f3ff] mt-2 opacity-50 tracking-widest font-bold uppercase">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 orbitron text-[10px] uppercase font-bold text-center">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
          </div>
        )}

        {step === AuthStep.WELCOME && (
          <div className="space-y-4">
            <button onClick={() => setStep(AuthStep.EMAIL_INPUT)} className="w-full bg-[#00f3ff]/5 border border-[#00f3ff]/20 text-white orbitron text-xs py-4 rounded hover:bg-[#00f3ff]/10 transition-all flex items-center justify-center gap-3">
              <i className="fa-solid fa-envelope"></i> Continue with Email
            </button>
            <div className="flex items-center gap-4 py-2 opacity-20"><div className="flex-1 h-[1px] bg-[#00f3ff]"></div><span className="orbitron text-[8px] text-[#00f3ff]">OR</span><div className="flex-1 h-[1px] bg-[#00f3ff]"></div></div>
            <button className="w-full bg-white/5 border border-white/10 text-white orbitron text-xs py-4 rounded hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              <i className="fa-brands fa-google text-red-500"></i> Continue with Google
            </button>
          </div>
        )}

        {step === AuthStep.EMAIL_INPUT && (
          <form onSubmit={checkEmail}>
            <p className="orbitron text-[9px] text-[#00f3ff] mb-4 uppercase tracking-widest font-bold">Identity Node (Email)</p>
            <TacticalInput value={email} onChange={setEmail} placeholder="ENTER_EMAIL_ADDRESS" autoFocus />
            <TacticalButton type="submit" loading={isLoading}>ACCESS_NODE &rarr;</TacticalButton>
            <button type="button" onClick={() => setStep(AuthStep.WELCOME)} className="w-full text-center orbitron text-[8px] text-[#00f3ff]/50 hover:text-[#00f3ff] mt-6 transition-all">&larr; ABORT_OPERATION</button>
          </form>
        )}

        {step === AuthStep.PASSWORD_LOGIN && (
          <div>
            <p className="orbitron text-[9px] text-[#00f3ff] mb-4 uppercase tracking-widest font-bold">NODE: {email}</p>
            <TacticalInput type="password" value={password} onChange={setPassword} placeholder="SECURITY_KEY" autoFocus />
            <TacticalButton onClick={() => handleAuth(false)} loading={isLoading}>DECRYPT_ACCESS</TacticalButton>
            <button type="button" onClick={() => setStep(AuthStep.EMAIL_INPUT)} className="w-full text-center orbitron text-[8px] text-[#00f3ff]/50 mt-6">&larr; SWITCH_NODE</button>
          </div>
        )}

        {step === AuthStep.PASSWORD_SIGNUP && (
          <div>
            <p className="orbitron text-[9px] text-[#00f3ff] mb-4 uppercase tracking-widest font-bold">INITIATING_ACCOUNT: {email}</p>
            <TacticalInput type="password" value={password} onChange={setPassword} placeholder="CREATE_STRONG_KEY" autoFocus />
            <TacticalButton onClick={() => handleAuth(true)} loading={isLoading}>ESTABLISH_SESSION</TacticalButton>
            <button type="button" onClick={() => setStep(AuthStep.EMAIL_INPUT)} className="w-full text-center orbitron text-[8px] text-[#00f3ff]/50 mt-6">&larr; REVERSE_ENROLL</button>
          </div>
        )}

        {step === AuthStep.OTP_VERIFY && (
          <div className="text-center">
            <p className="orbitron text-[10px] text-white mb-2 uppercase tracking-widest">VERIFICATION_CODE_SENT</p>
            <p className="orbitron text-[8px] text-[#00f3ff]/60 mb-8 lowercase tracking-widest">check {email}</p>
            <div className="flex justify-between gap-2 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 bg-black border border-[#00f3ff]/30 text-[#00f3ff] text-center orbitron text-xl font-black focus:border-[#00f3ff] outline-none rounded shadow-[0_0_10px_rgba(0,243,255,0.1)]"
                />
              ))}
            </div>
            <TacticalButton onClick={() => verifyOtp(otp.join(''))} loading={isLoading}>VERIFY_IDENTITY</TacticalButton>
            <button className="orbitron text-[8px] text-[#00f3ff]/50 mt-8 hover:underline">RESEND_ENCRYPTION_CODE</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginView;