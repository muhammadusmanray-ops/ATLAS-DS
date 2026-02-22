import React from 'react';

export interface UIConfig {
    chatInputBottom: number;
    sidebarWidth: number;
    sidebarScroll: boolean;
    dashboardScroll: boolean;
    glassOpacity: number;
    accentColor: string;
}

interface UIAdjusterProps {
    config: UIConfig;
    onChange: (config: UIConfig) => void;
    onFix: () => void;
}

export const UIAdjuster: React.FC<UIAdjusterProps> = ({ config, onChange, onFix }) => {
    const handleChange = (key: keyof UIConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    return (
        <div className="p-8 space-y-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 pb-32">
            <div className="flex flex-col gap-2 border-l-4 border-[#76b900] pl-6 mb-12">
                <h2 className="text-3xl orbitron font-black text-white tracking-[0.2em] uppercase">Tactical Designer</h2>
                <p className="text-[10px] orbitron text-gray-500 tracking-[0.3em] font-bold">Manual UI Override Prototype v1.0</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CHAT POSITION */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] orbitron font-bold text-gray-400 uppercase tracking-widest">Chat Input Altitude</span>
                        <span className="text-[#76b900] font-mono text-xs">{config.chatInputBottom}px</span>
                    </div>
                    <input
                        type="range" min="0" max="200" step="5"
                        value={config.chatInputBottom}
                        onChange={(e) => handleChange('chatInputBottom', parseInt(e.target.value))}
                        className="w-full accent-[#76b900]"
                    />
                    <p className="text-[8px] text-gray-600 uppercase font-bold tracking-tighter italic">Adjust height of the tactical relay input node.</p>
                </div>

                {/* SIDEBAR WIDTH */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] orbitron font-bold text-gray-400 uppercase tracking-widest">Sidebar Magnitude</span>
                        <span className="text-[#00f3ff] font-mono text-xs">{config.sidebarWidth}px</span>
                    </div>
                    <input
                        type="range" min="200" max="450" step="10"
                        value={config.sidebarWidth}
                        onChange={(e) => handleChange('sidebarWidth', parseInt(e.target.value))}
                        className="w-full accent-[#00f3ff]"
                    />
                    <p className="text-[8px] text-gray-600 uppercase font-bold tracking-tighter italic">Adjust lateral deployment of the command sidebar.</p>
                </div>

                {/* TOGGLES */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] orbitron font-bold text-gray-400 uppercase tracking-widest">Sidebar Scroll</span>
                        <button
                            onClick={() => handleChange('sidebarScroll', !config.sidebarScroll)}
                            className={`w-12 h-6 rounded-full transition-all relative ${config.sidebarScroll ? 'bg-[#76b900]' : 'bg-gray-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.sidebarScroll ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[10px] orbitron font-bold text-gray-400 uppercase tracking-widest">Dashboard Scroll</span>
                        <button
                            onClick={() => handleChange('dashboardScroll', !config.dashboardScroll)}
                            className={`w-12 h-6 rounded-full transition-all relative ${config.dashboardScroll ? 'bg-[#76b900]' : 'bg-gray-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.dashboardScroll ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                {/* GLASS EFFECT */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] orbitron font-bold text-gray-400 uppercase tracking-widest">Glass Density</span>
                        <span className="text-white font-mono text-xs">{Math.round(config.glassOpacity * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.05"
                        value={config.glassOpacity}
                        onChange={(e) => handleChange('glassOpacity', parseFloat(e.target.value))}
                        className="w-full accent-white"
                    />
                </div>
            </div>

            {/* COMMIT ACTION */}
            <div className="flex justify-center pt-8">
                <button
                    onClick={onFix}
                    className="px-12 py-5 bg-[#76b900] text-black orbitron font-black uppercase tracking-[0.5em] text-sm rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(118,185,0,0.3)] group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    LOCK_PROTOCOL_FIX_UI
                </button>
            </div>

            <p className="text-[7px] text-center text-gray-800 orbitron uppercase tracking-[0.5em]">Safety Protocol: Configuration is buffered in local intelligence buffer.</p>
        </div>
    );
};
