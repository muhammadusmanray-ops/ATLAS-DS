
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const CareerOps: React.FC = () => {
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{text: string, links: any[]} | null>(null);
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
      
      const response = await geminiService.chat(prompt);
      setProposal(response.text || 'Proposal generation failed.');
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
            <h2 className="text-4xl font-black text-white orbitron italic tracking-tight">Career<span className="text-yellow-400">_OPS</span></h2>
            <p className="text-gray-400 text-sm uppercase tracking-widest">Autonomous Job Scout & Diplomacy Engine</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col: Job Scout */}
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-radar text-yellow-400"></i> Global Job Scout
                    </h3>
                    
                    {/* Scout Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {scouts.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => { setSearchQuery(s.query); handleSearch(s.query); }}
                                className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                            >
                                <i className={`fa-solid ${s.icon}`}></i> {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="e.g. 'Remote React Developer'"
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-yellow-400 outline-none"
                        />
                        <button 
                            onClick={() => handleSearch()}
                            className="bg-yellow-500 text-black font-bold px-4 rounded-xl hover:bg-yellow-400 transition-colors"
                        >
                            <i className={`fa-solid ${isSearching ? 'fa-circle-notch fa-spin' : 'fa-search'}`}></i>
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="h-96 overflow-y-auto custom-scrollbar bg-black/30 rounded-xl p-4 border border-white/5">
                        {isSearching ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <i className="fa-solid fa-satellite-dish fa-spin text-4xl text-yellow-400 mb-4"></i>
                                <span className="text-[10px] uppercase tracking-widest">Scanning Frequencies...</span>
                            </div>
                        ) : searchResults ? (
                            <div className="space-y-4">
                                {searchResults.links.length > 0 ? (
                                    searchResults.links.map((link, idx) => (
                                        <a 
                                            key={idx} 
                                            href={link.uri} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="block p-3 bg-white/5 rounded-lg border border-white/5 hover:border-yellow-400/50 hover:bg-white/10 transition-all group"
                                        >
                                            <p className="text-xs font-bold text-gray-200 group-hover:text-yellow-400 truncate">{link.title}</p>
                                            <p className="text-[9px] text-gray-600 truncate mt-1">{link.uri}</p>
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 text-center">No distinct signals found. Try a different frequency.</p>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20">
                                <i className="fa-solid fa-globe text-6xl mb-2"></i>
                                <span className="text-[10px] uppercase tracking-widest">Awaiting Scan Protocol</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Col: Proposal Generator */}
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl h-full flex flex-col">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <i className="fa-solid fa-file-signature text-[#00f3ff]"></i> Proposal Generator
                    </h3>

                    <div className="flex-1 space-y-4 flex flex-col">
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Job Description</label>
                             <textarea 
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the client's job description here..."
                                className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-gray-300 outline-none focus:border-[#00f3ff] transition-colors resize-none"
                             />
                        </div>

                        <button 
                            onClick={handleGenerateProposal}
                            disabled={isWriting || !jobDescription}
                            className={`w-full py-4 rounded-xl orbitron font-bold text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${
                                isWriting ? 'bg-gray-800 text-gray-500' : 'bg-[#00f3ff] text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                            }`}
                        >
                            {isWriting ? <i className="fa-solid fa-pen-nib fa-bounce"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            {isWriting ? 'DRAFTING DIPLOMACY...' : 'GENERATE WINNING PROPOSAL'}
                        </button>

                        <div className="flex-1 bg-black/30 rounded-xl border border-white/5 relative overflow-hidden flex flex-col min-h-[300px]">
                            {proposal ? (
                                <>
                                    <div className="absolute top-2 right-2">
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(proposal)}
                                            className="bg-black/80 hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border border-[#00f3ff]/30 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all"
                                        >
                                            Copy Text
                                        </button>
                                    </div>
                                    <div className="p-6 overflow-y-auto custom-scrollbar">
                                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">{proposal}</pre>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <i className="fa-solid fa-handshake text-6xl mb-2"></i>
                                    <span className="text-[10px] uppercase tracking-widest">Proposal Output Area</span>
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
