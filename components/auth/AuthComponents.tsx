import React from 'react';

/**
 * Shared layout for all auth screens
 */
export const AuthLayout: React.FC<{ children: React.ReactNode; showLogo?: boolean }> = ({ children, showLogo = true }) => {
    return (
        <div className="min-h-screen w-full bg-[#020203] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

            {/* Global Pattern Grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
                {showLogo && (
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/5">
                            <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">ATLAS <span className="text-emerald-500">DS</span></h2>
                        <p className="text-slate-500 text-sm mt-1">Intelligence Protocol v3.1</p>
                    </div>
                )}

                <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/50 rounded-[2rem] p-8 shadow-2xl relative">
                    {children}
                </div>

                {/* Footer Legal */}
                <div className="mt-8 flex justify-center items-center gap-6 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    <span>Terms</span>
                    <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                    <span>Privacy</span>
                    <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                    <span>Contact</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Custom Divider with text
 */
export const Divider: React.FC<{ text?: string }> = ({ text = "OR" }) => (
    <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0b0c10] px-3 text-slate-500 font-bold tracking-widest">{text}</span>
        </div>
    </div>
);

/**
 * Message status info
 */
export const StatusInfo: React.FC<{ message: string; type?: 'info' | 'error' | 'success' }> = ({ message, type = 'info' }) => {
    const styles = {
        info: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        error: 'bg-red-500/10 border-red-500/20 text-red-500',
        success: 'bg-green-500/10 border-green-500/20 text-green-500'
    };

    return (
        <div className={`p-4 rounded-xl border ${styles[type]} text-xs text-center font-medium animate-in slide-in-from-top-2 duration-300`}>
            {message}
        </div>
    );
};
