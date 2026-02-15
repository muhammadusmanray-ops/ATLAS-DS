
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { llmAdapter } from '../services/llm';

const CareerOps: React.FC = () => {
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ text: string, links: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Proposal State
    const [jobDescription, setJobDescription] = useState('');
    const [proposal, setProposal] = useState<string | null>(null);
    const [isWriting, setIsWriting] = useState(false);

    // Pre-defined search buttons
    const scouts = [
        { label: 'Remote ML Jobs', query: 'remote junior machine learning engineer jobs 2024 apply now', icon: 'fa-laptop-code' },
        { label: 'Freelance Python', query: 'freelance python automation projects upwork freelancer recent', icon: 'fa-sack-dollar' },
        { label: 'Data Cleaning Gigs', query: 'freelance data cleaning and preparation jobs remote', icon: 'fa-broom' },
    ];

    const handleSearch = async (overrideQuery?: string) => {
        const q = overrideQuery || searchQuery;
        if (!q.trim()) return;

        setIsSearching(true);
        setSearchResults(null);
        try {
            // Using tacticalSearch which uses Google Search Grounding
            const res = await geminiService.tacticalSearch(q);
            setSearchResults(res);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerateProposal = async () => {
        if (!jobDescription.trim()) return;
        setIsWriting(true);
        try {
            const prompt = `Act as a Top-Tier Freelance Software Engineer & Data Specialist. Write a winning, persuasive cover letter/proposal for this job description.
      
      JOB DESCRIPTION:
      ${jobDescription}

      MY PROFILE/STRENGTHS:
      - Expert in Python, Automation, and Data Cleaning.
      - I use advanced AI agents (ATLAS-X) to deliver work 5x faster than others.
      - High attention to detail, reliability, and clear communication.
      - Focus on delivering "Production-Ready" results.

      TONE: Professional, Confident, but not arrogant. Concise.
      STRUCTURE:
      1. Hook (I can solve your specific problem).
      2. Solution (How I will do it).
      3. Call to Action (Let's chat).
      `;

            const response = await llmAdapter.chat(prompt, "You are a Top-Tier Freelance Software Engineer specializing in Winning Proposals.");
            setProposal(response?.text || 'Proposal generation failed.');
        } catch (e) {
            setProposal('Error: Diplomacy module offline.');
        } finally {
            setIsWriting(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto bg-[#020203]">
            <div className="max-w-7xl mx-auto w-full space-y-12">
                <header className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-white orbitron italic tracking-tight uppercase">Career<span className="text-[#00f3ff]">_OPS</span></h2>
                    <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em] font-bold">Autonomous Job Scout & Diplomacy Engine</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Col: Job Scout */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-xl">
                            <h3 className="text-xs font-black text-white orbitron uppercase tracking-[0.3em] flex items-center gap-3">
                                <i className="fa-solid fa-satellite-dish text-[#00f3ff]"></i> Global Job Scout
                            </h3>

                            {/* Scout Buttons */}
                            <div className="flex flex-wrap gap-2">
                                {scouts.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setSearchQuery(s.query); handleSearch(s.query); }}
                                        className="px-4 py-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30 rounded-xl text-[9px] orbitron font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                                    >
                                        <i className={`fa-solid ${s.icon} text-[10px]`}></i> {s.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. 'Remote ML Engineer'"
                                    className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-[#00f3ff] outline-none transition-all placeholder:text-gray-800 font-mono"
                                />
                                <button
                                    onClick={() => handleSearch()}
                                    className="bg-[#00f3ff] text-black font-black orbitron text-xs px-6 rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] active:scale-95"
                                >
                                    {isSearching ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                                </button>
                            </div>

                            {/* Results Area */}
                            <div className="h-[500px] overflow-y-auto custom-scrollbar bg-black/40 rounded-[32px] p-6 border border-white/5 shadow-inner">
                                {isSearching ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                                        <i className="fa-solid fa-network-wired fa-spin text-5xl text-[#00f3ff]"></i>
                                        <span className="text-[9px] orbitron font-bold uppercase tracking-[0.4em]">Propagating Sector Scan...</span>
                                    </div>
                                ) : searchResults ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            {searchResults.links.map((link, idx) => (
                                                <div key={idx} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden group/item hover:border-[#00f3ff]/30 transition-all duration-500">
                                                    <div className="p-6 flex items-center gap-5 border-b border-white/5 bg-white/[0.02]">
                                                        <div className="w-14 h-14 rounded-2xl bg-[#00f3ff]/10 border border-[#00f3ff]/20 flex items-center justify-center text-[#00f3ff] group-hover/item:bg-[#00f3ff] group-hover/item:text-black transition-all shadow-xl">
                                                            <i className="fa-solid fa-briefcase text-xl"></i>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[8px] orbitron font-black text-[#00f3ff] tracking-widest uppercase">Target_Node_0{idx + 1}</span>
                                                                <div className="flex gap-2">
                                                                    <span className="text-[7px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{new URL(link.uri).hostname}</span>
                                                                    <span className="text-[7px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-400/30 uppercase tracking-widest">LIVE</span>
                                                                </div>
                                                            </div>
                                                            <h4 className="text-sm font-black text-white uppercase truncate tracking-tight">{link.title}</h4>
                                                        </div>
                                                    </div>

                                                    {/* DATA PREVIEW PANEL */}
                                                    <div className="p-6 space-y-4">
                                                        <div className="bg-black/60 rounded-2xl p-5 border border-white/5 shadow-inner">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <span className="text-[8px] orbitron font-black text-gray-600 uppercase tracking-widest">AIG_Telemetry_Feed</span>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                                                    <span className="text-[8px] orbitron text-green-500 font-black uppercase">Verified Intel</span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-3 mb-5">
                                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                                                    <p className="text-[7px] orbitron text-gray-600 uppercase font-black">Relevance</p>
                                                                    <p className="text-[11px] text-white font-black orbitron uppercase">98%</p>
                                                                </div>
                                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                                                    <p className="text-[7px] orbitron text-gray-600 uppercase font-black">Latency</p>
                                                                    <p className="text-[11px] text-white font-black orbitron uppercase">14ms</p>
                                                                </div>
                                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                                                    <p className="text-[7px] orbitron text-gray-600 uppercase font-black">Node</p>
                                                                    <i className="fa-solid fa-server text-[#00f3ff] text-[10px]"></i>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={link.uri}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="w-full py-3 bg-[#00f3ff] text-black rounded-2xl text-[9px] orbitron font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[0_10px_30px_rgba(0,243,255,0.2)]"
                                                            >
                                                                <i className="fa-solid fa-arrow-up-right-from-square"></i> Engage Opportunity
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                                        <i className="fa-solid fa-radar text-9xl"></i>
                                        <span className="text-[10px] orbitron font-black uppercase tracking-[0.5em]">Sector_Quiet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Proposal Generator */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] h-full flex flex-col backdrop-blur-xl">
                            <h3 className="text-xs font-black text-white orbitron uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                                <i className="fa-solid fa-feather-pointed text-[#00f3ff]"></i> Diplomacy Engine
                            </h3>

                            <div className="flex-1 space-y-6 flex flex-col">
                                <div className="space-y-3">
                                    <label className="text-[9px] orbitron font-black text-gray-600 uppercase tracking-widest px-2">Mission_Parameters (JD)</label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste clinical or technical requirements..."
                                        className="w-full h-40 bg-black/60 border border-white/5 rounded-3xl p-6 text-xs text-gray-300 outline-none focus:border-[#00f3ff] transition-all resize-none shadow-inner placeholder:text-gray-800"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateProposal}
                                    disabled={isWriting || !jobDescription}
                                    className={`w-full py-5 rounded-3xl orbitron font-black text-xs tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl ${isWriting ? 'bg-gray-800 text-gray-500 animate-pulse' : 'bg-[#00f3ff] text-black hover:bg-white hover:scale-[1.02] shadow-[0_10px_40px_rgba(0,243,255,0.2)]'
                                        }`}
                                >
                                    {isWriting ? <i className="fa-solid fa-dna fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                                    {isWriting ? 'SEQUENCING DIPLOMACY...' : 'AUTHOR BLUEPRINT'}
                                </button>

                                <div className="flex-1 bg-black/40 rounded-[32px] border border-white/5 relative overflow-hidden flex flex-col min-h-[300px] shadow-inner">
                                    {proposal ? (
                                        <>
                                            <div className="absolute top-4 right-4 z-10">
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(proposal)}
                                                    className="bg-black/60 hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border border-[#00f3ff]/20 px-4 py-1.5 rounded-full text-[8px] orbitron font-black uppercase tracking-widest transition-all shadow-xl"
                                                >
                                                    <i className="fa-solid fa-copy mr-2"></i>Copy_Spec
                                                </button>
                                            </div>
                                            <div className="p-8 overflow-y-auto custom-scrollbar selection:bg-[#00f3ff] selection:text-black">
                                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed font-medium">{proposal}</pre>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                                            <i className="fa-solid fa-scroll text-8xl"></i>
                                            <span className="text-[10px] orbitron font-black uppercase tracking-[0.5em]">Awaiting_Payload</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerOps;
