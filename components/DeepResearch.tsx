
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';

const DeepResearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [trends, setTrends] = useState<string[]>([]);

    const DS_TRENDS_2026 = [
        "Agentic AI Orchestration",
        "Physical AI & Robotics Integration",
        "Small Language Models (SLMs) Optimization",
        "MLOps 2.0: Scalable AI Engineering",
        "Multimodal Synthetic Data Generation",
        "Edge AI Latency Reduction",
        "Ethical AI Governance Guardrails"
    ];

    useEffect(() => {
        setTrends(DS_TRENDS_2026);
    }, []);

    const performResearch = async (searchTerm: string = query) => {
        if (!searchTerm && !query) return;
        setIsLoading(true);
        try {
            const res = await geminiService.tacticalSearch(searchTerm);
            setResults(res);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col p-6 md:p-12 bg-[#020204] relative selection:bg-[#76b900] selection:text-black">
            {/* Background HUD Elements */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#76b900 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="max-w-7xl mx-auto w-full space-y-12 relative z-10 font-sans">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-10 bg-[#76b900] shadow-[0_0_20px_#76b900]"></div>
                            <h2 className="text-5xl font-black text-white orbitron tracking-tighter italic uppercase">Deep_Intel<span className="text-[#76b900]">_Research</span></h2>
                        </div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.5em] flex items-center gap-2">
                            <i className="fa-solid fa-satellite-dish animate-pulse"></i>
                            Global Sector Scan: Active | February_2026_Context
                        </p>
                    </div>
                    <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-3xl flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] orbitron font-bold text-gray-500 uppercase tracking-widest">Logic_Node</span>
                            <span className="text-xs font-black text-[#76b900] orbitron">META-LLAMA-4</span>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <i className="fa-solid fa-microchip text-xl text-[#76b900]"></i>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Research Input & Trends */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#76b900]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                            <h3 className="text-[10px] font-black text-white orbitron uppercase tracking-[0.4em] mb-8 flex items-center gap-3 relative z-10">
                                <i className="fa-solid fa-magnifying-glass text-[#76b900]"></i> Tactical_Search
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && performResearch()}
                                    placeholder="SCANING_FOR_DATA_SCIENCE_ANOMALIES..."
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-[#76b900] outline-none transition-all placeholder:text-gray-700 font-mono"
                                />
                                <button
                                    onClick={() => performResearch()}
                                    disabled={isLoading}
                                    className="w-full py-5 bg-[#76b900] text-black font-black orbitron text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(118,185,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'EXECUTING_SCAN...' : 'INITIATE_DEEP_SEARCH'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-3xl shadow-2xl">
                            <h3 className="text-[10px] font-black text-white orbitron uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-chart-line text-[#76b900]"></i> 2026_Trend_Matrix
                            </h3>
                            <div className="space-y-3">
                                {trends.map((trend, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setQuery(trend);
                                            performResearch(trend);
                                        }}
                                        className="w-full text-left p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-[#76b900]/40 hover:bg-[#76b900]/5 transition-all group flex items-center justify-between"
                                    >
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-tight">{trend}</span>
                                        <i className="fa-solid fa-chevron-right text-[10px] text-gray-700 group-hover:text-[#76b900] transition-colors"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Intelligence Results */}
                    <div className="lg:col-span-8">
                        <div className="bg-[#050508] border border-white/10 rounded-[48px] h-full min-h-[600px] flex flex-col relative overflow-hidden shadow-inner">
                            {/* Terminal Header */}
                            <div className="px-10 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#76b900]/20 border border-[#76b900]/40 animate-pulse"></div>
                                </div>
                                <span className="text-[9px] orbitron font-black text-gray-600 uppercase tracking-widest">INTEL_FEED_v3.1</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                {isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-50">
                                        <i className="fa-solid fa-atom fa-spin text-8xl text-[#76b900]"></i>
                                        <p className="orbitron font-black text-[10px] uppercase tracking-[0.5em] text-white animate-pulse">Decrypting_Global_Sensors...</p>
                                    </div>
                                ) : results ? (
                                    <div className="space-y-10 animate-in fade-in duration-700">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-brain text-[#76b900]"></i>
                                                <h4 className="text-white orbitron font-black text-xs uppercase tracking-widest">Neural_Synthesis_Report</h4>
                                            </div>
                                            <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[40px] shadow-inner text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap font-sans selection:bg-[#76b900] selection:text-black">
                                                {results.text}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-link text-[#76b900]"></i>
                                                <h4 className="text-white orbitron font-black text-xs uppercase tracking-widest">External_Intel_Links</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {results.links && Array.isArray(results.links) && results.links.map((link: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={link.uri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-5 bg-black rounded-3xl border border-white/5 hover:border-[#76b900]/40 transition-all group flex flex-col gap-3"
                                                    >
                                                        <span className="text-[10px] orbitron font-black text-[#76b900] truncate">{link.title}</span>
                                                        <span className="text-[8px] text-gray-600 font-bold uppercase truncate">{link.uri}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center space-y-10 opacity-10">
                                        <i className="fa-solid fa-satellite text-9xl text-white"></i>
                                        <div className="space-y-2 text-center">
                                            <p className="orbitron font-black text-sm uppercase tracking-[1em] text-white">AWAITING_UPLINK</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Initiate search to scan Data Science field</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeepResearch;
