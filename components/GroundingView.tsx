
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';


const GroundingView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ text: string, links: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [viewType, setViewType] = useState<'search' | 'maps'>('search');

    // Simulated Scanning Steps for "Interesting" UI
    const [scanSteps, setScanSteps] = useState<string[]>([]);

    const handleSearch = async () => {
        setIsSearching(true);
        setScanSteps(["Initializing Uplink...", "Handshaking with Google Search Nodes...", "Indexing Data Centers..."]);

        // Simulate thinking process
        setTimeout(() => setScanSteps(prev => [...prev, "Filtering Verifiable Sources...", "Synthesizing Intelligence..."]), 1000);

        try {
            if (viewType === 'search') {
                const res = await geminiService.tacticalSearch(query || "Analysis of Nvidia Blackwell Architecture benchmarks 2025.");
                setResults(res);
            } else {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const res = await geminiService.findDataHubs({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                    setResults(res);
                });
            }
        } catch (e) {
            console.error(e);
            setScanSteps(prev => [...prev, "CRITICAL_ERROR: Transmission Interrupted."]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#020203] overflow-hidden relative">
            {/* HUD Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#76b900 1px, transparent 1px), linear-gradient(90deg, #76b900 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto w-full p-8 flex flex-col h-full relative z-10">

                {/* HEADER AREA */}
                <header className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#76b900] shadow-[0_0_10px_#76b900] animate-pulse"></div>
                            <h2 className="text-2xl font-black text-white orbitron tracking-[0.2em] uppercase">Grounding_Engine_v3</h2>
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.4em]">Real-time Intelligence Acquisition & Verification</p>
                    </div>

                    <div className="flex gap-4">
                        {/* SMALL METRIC SCREEN 1 */}
                        <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center">
                            <span className="text-[7px] orbitron text-[#76b900] uppercase font-bold tracking-widest">Compute Core</span>
                            <span className="text-[10px] text-white font-black">Gemini 1.5 PRO</span>
                        </div>
                        {/* SMALL METRIC SCREEN 2 */}
                        <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center">
                            <span className="text-[7px] orbitron text-[#76b900] uppercase font-bold tracking-widest">Signal Status</span>
                            <span className="text-[10px] text-white font-black">{isSearching ? 'SCROLLING...' : 'SYNCED'}</span>
                        </div>
                    </div>
                </header>

                {/* SEARCH & HUD GRID */}
                <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">

                    {/* LEFT COLUMN: Input & Activity Log */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

                        {/* INPUT DABA */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                            <div className="text-[9px] text-[#76b900] orbitron font-bold uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-crosshairs text-xs"></i> Target Parameters
                            </div>
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Define research niche (e.g. 'Nvidia DGX SuperPOD specs')..."
                                className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-gray-300 outline-none focus:border-[#76b900]/50 transition-all resize-none"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="w-full py-4 bg-[#76b900] text-black font-black orbitron text-xs tracking-[0.3em] rounded-2xl hover:bg-[#86d400] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(118,185,0,0.2)]"
                            >
                                {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                                {isSearching ? 'SCANNING...' : 'EXECUTE SCAN'}
                            </button>
                        </div>

                        {/* TELEMETRY SCREEN: PROCESS LOG */}
                        <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col">
                            <div className="text-[9px] text-gray-500 orbitron font-bold uppercase tracking-widest mb-4 flex justify-between">
                                <span>Neural_Activity_Log</span>
                                <span className="text-[#76b900]">AUTO_SCAN</span>
                            </div>
                            <div className="space-y-2 font-mono text-[9px] overflow-y-auto custom-scrollbar flex-1">
                                {scanSteps.map((step, i) => (
                                    <div key={i} className="flex gap-3 text-gray-400">
                                        <span className="text-[#76b900]">{`> [${(i + 1).toString().padStart(2, '0')}]`}</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                                {isSearching && <div className="text-[#76b900] animate-pulse">_ SCROLLING DATABASE...</div>}
                                {!isSearching && scanSteps.length === 0 && <div className="text-gray-600 italic">Terminal awaiting handshake.</div>}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Results & Sources */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 min-h-0">

                        {results ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                {/* THE INTEL BOX */}
                                <div className="bg-white/5 border-l-4 border-[#76b900] p-8 rounded-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <i className="fa-solid fa-brain text-7xl text-[#76b900]"></i>
                                    </div>
                                    <h3 className="text-xs font-black orbitron text-[#76b900] uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                        <i className="fa-solid fa-microchip"></i> Synthesized Intelligence
                                    </h3>
                                    <div className="text-gray-100 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                        {results.text}
                                    </div>
                                </div>

                                {/* SOURCE GRID */}
                                <div className="space-y-4">
                                    <h3 className="text-[9px] orbitron font-bold text-gray-600 uppercase tracking-widest">Verifiable Source Nodes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {results.links.map((link, i) => (
                                            <div key={i} className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden group/source">
                                                <div className="p-4 flex items-center gap-4 bg-white/[0.02] border-b border-white/5">
                                                    <div className="w-10 h-10 rounded-xl bg-[#76b900]/10 flex items-center justify-center text-[#76b900] group-hover/source:bg-[#76b900] group-hover/source:text-black transition-all">
                                                        <i className="fa-solid fa-satellite-dish text-xs"></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[7px] orbitron font-bold text-[#76b900] uppercase tracking-widest">Source_Node_{i + 1}</span>
                                                        <h4 className="text-[10px] font-bold text-white uppercase truncate">{link.title}</h4>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex justify-between items-center text-[8px] font-mono text-gray-500">
                                                        <span>DOMAIN: {new URL(link.uri).hostname}</span>
                                                        <span className="text-green-500">VERIFIED</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1 bg-black/40 p-1.5 rounded border border-white/5 text-center">
                                                            <p className="text-[6px] text-gray-600 uppercase">Latency</p>
                                                            <p className="text-[8px] text-white">18ms</p>
                                                        </div>
                                                        <div className="flex-1 bg-black/40 p-1.5 rounded border border-white/5 text-center">
                                                            <p className="text-[6px] text-gray-600 uppercase">Integrity</p>
                                                            <p className="text-[8px] text-[#00f3ff]">98.2%</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={link.uri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-2 bg-[#76b900]/10 hover:bg-[#76b900] text-[#76b900] hover:text-black border border-[#76b900]/30 rounded-lg text-[8px] orbitron font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <i className="fa-solid fa-arrow-up-right-from-square"></i> Access Intel
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/10 rounded-[40px] p-12 text-center group">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-full border border-[#76b900]/20 flex items-center justify-center text-5xl text-gray-700 group-hover:text-[#76b900] transition-all duration-700">
                                        <i className="fa-solid fa-satellite animate-pulse"></i>
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#76b900]/30 animate-spin"></div>
                                </div>
                                <h3 className="text-sm font-black orbitron text-white uppercase tracking-[0.5em] mb-4">Awaiting_Uplink</h3>
                                <p className="text-gray-500 text-xs max-w-sm leading-relaxed uppercase tracking-widest font-bold opacity-60">
                                    Satellite connection established. <br />
                                    Input niche research query to begin live data acquisition.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default GroundingView;
