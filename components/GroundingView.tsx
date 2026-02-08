
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const GroundingView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{text: string, links: any[]} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [viewType, setViewType] = useState<'search' | 'maps'>('search');

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      if (viewType === 'search') {
        // Fix: Corrected method name to tacticalSearch
        const res = await geminiService.tacticalSearch(query || "Find novel autonomous data cleaning research papers 2024-2025.");
        setResults(res);
      } else {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          // Fix: findDataHubs is now defined in geminiService
          const res = await geminiService.findDataHubs({ 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          });
          setResults(res);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Grounding Intelligence</h2>
                <p className="text-gray-500">Connect AI insights with real-world news and geographic infrastructure data.</p>
            </div>
            <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                <button 
                    onClick={() => { setViewType('search'); setResults(null); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewType === 'search' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <i className="fa-solid fa-search mr-2"></i> Web Search
                </button>
                <button 
                    onClick={() => { setViewType('maps'); setResults(null); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewType === 'maps' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <i className="fa-solid fa-location-dot mr-2"></i> Maps Logic
                </button>
            </div>
        </header>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-8 space-y-8">
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={viewType === 'search' ? "Research niche: 'Autonomous data forensics in LLMs'..." : "Searching for data hubs in your current proximity..."}
                        className="flex-1 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-8 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                        {isSearching ? 'FETCHING' : 'EXECUTE'}
                    </button>
                </div>

                {results ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                            {results.text}
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Verifiable Sources</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.links.map((link, i) => (
                                    <a 
                                        key={i} 
                                        href={link.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <i className={`fa-solid ${viewType === 'search' ? 'fa-link' : 'fa-map-pin'}`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{link.title}</p>
                                            <p className="text-[10px] text-gray-400 truncate font-mono">{link.uri}</p>
                                        </div>
                                        <i className="fa-solid fa-arrow-up-right-from-square text-gray-300 text-xs"></i>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 text-5xl">
                            <i className={`fa-solid ${viewType === 'search' ? 'fa-microchip' : 'fa-satellite'}`}></i>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Awaiting Grounding Request</p>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">Use this interface to find novel work in data science that hasn't been implemented yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GroundingView;
