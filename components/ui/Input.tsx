import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full bg-slate-900 border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500
          outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 ml-1 mt-1 font-medium italic">
                    {error}
                </p>
            )}
        </div>
    );
};
