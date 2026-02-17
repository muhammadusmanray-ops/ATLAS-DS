import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] orbitron font-bold text-slate-500 ml-1 uppercase tracking-widest">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full bg-slate-900 border rounded-lg py-3 text-slate-100 placeholder-slate-600
                        outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                        transition-all duration-200 orbitron text-xs tracking-wider
                        ${icon ? 'pl-11 pr-4' : 'px-4'}
                        ${error ? 'border-red-500' : 'border-slate-800 hover:border-slate-700'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[9px] text-red-500 ml-1 mt-1 orbitron uppercase">
                    {error}
                </p>
            )}
        </div>
    );
};
