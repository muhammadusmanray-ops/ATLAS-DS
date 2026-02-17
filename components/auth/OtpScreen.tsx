import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface OtpScreenProps {
    email: string;
    onVerify: (code: string) => void;
    onResend: () => void;
    isLoading: boolean;
    error?: string;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({ email, onVerify, onResend, isLoading, error: propError }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto submit if complete
        if (index === 5 && value) {
            onVerify(newOtp.join('') + value.charAt(value.length - 1)); // handle edge case of last char
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(otp.join(''));
    };

    return (
        <div className="flex flex-col items-center justify-center min-vh-screen p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="h-12 w-12 bg-slate-800 border border-slate-700 rounded-xl mx-auto flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Check your email</h1>
                    <p className="text-slate-400">We sent a temporary login code to <br /><span className="text-slate-200 font-medium">{email}</span></p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                />
                            ))}
                        </div>

                        {propError && <p className="text-center text-sm text-red-400">{propError}</p>}

                        <Button type="submit" isLoading={isLoading} className="w-full">
                            Verify Code
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Didn't receive the email?{' '}
                            <button onClick={onResend} className="text-emerald-400 hover:underline font-medium">
                                Click to resend
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
