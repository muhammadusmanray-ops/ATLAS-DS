import React, { useState, useEffect, useRef } from 'react';
import { llmAdapter } from '../services/llm';
import { geminiService } from '../services/gemini';
import { db } from '../services/storage';
import { AppView } from '../types';

interface TacticalAssistantProps {
    currentView: AppView;
}

const TacticalAssistant: React.FC<TacticalAssistantProps> = ({ currentView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: 'bot' | 'user'; content: string }>>([
        { role: 'bot', content: "COMMANDER: Tactical Assistant online. System monitoring active. How can I help you with the Node Cluster today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // SECTOR ISOLATION: Assistant only manifests in Settings & Security Hub
    // This check MUST come AFTER all hooks to comply with React's Rules of Hooks
    if (currentView !== AppView.SETTINGS && currentView !== AppView.SECURITY) return null;


    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Analyze intent
            const lowered = userMsg.toLowerCase();
            let systemResponse = "";

            if (lowered.includes('key') || lowered.includes('api')) {
                const keys = geminiService.getMaskedKeys();
                systemResponse = `PROTOCOL_INFO: You have ${keys.length} Gemini Node(s) active. Current rotation: [${keys.join(', ') || 'No keys loaded'}]. You can add more in Config to 'Refuel' the cluster.`;
            } else if (lowered.includes('fuel') || lowered.includes('limit')) {
                const quota = llmAdapter.getQuota();
                systemResponse = `STATUS_REPORT: Gemini fuel is at ${Math.max(0, 15 - quota.gemini.count)}/15 calls before depletion. Groq tokens remaining: ${quota.groq.tokens}. To refuel, simply add a fresh API key in Settings.`;
            } else if (lowered.includes('deploy')) {
                systemResponse = `ENG_ADVICE: When deploying to Vercel, your Identity (Neon DB) will persist. Any API keys you save in the cluster now will stay available in your Cloud Vault. No need to re-upload!`;
            } else {
                // Generic AI Response - High Logic Mode
                const response = await llmAdapter.chat(
                    userMsg,
                    `You are the Tactical Assistant for ATLAS-X. 
                    COMMANDER: Usman Bhai.
                    MISSION: Provide smart, technical Data Science insights.
                    CRITICAL: ALWAYS provide a technical link (Kaggle Dataset or ArXiv). YOU MUST INCLUDE THE FULL URL (https://...). NEVER FAIL THIS.
                    TONE: Extremely short, robotic, tactical. Use 'Commander', 'Sector', 'Neural Node'.`,
                    messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }))
                );
                systemResponse = response.text;
            }

            setMessages(prev => [...prev, { role: 'bot', content: systemResponse }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'bot', content: "ERROR: Comm-Link disrupted. Check satellite uplink." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Assistant Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 h-96 bg-black/90 border border-[#76b900]/30 rounded-2xl shadow-[0_0_40px_rgba(118,185,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 backdrop-blur-xl">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#76b900] shadow-[0_0_10px_#76b900] animate-pulse"></div>
                            <span className="orbitron text-[10px] font-black text-white uppercase tracking-widest">Tactical Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex items-start gap-3 ${m.role === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(118,185,0,0.2)] ${m.role === 'bot' ? 'bg-[#76b900]/10 text-[#76b900]' : 'bg-white/10 text-white'}`}>
                                    <i className={`fa-solid ${m.role === 'bot' ? 'fa-ghost' : 'fa-user-ninja'}`}></i>
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-xl text-[11px] leading-relaxed ${m.role === 'bot'
                                    ? 'bg-white/5 text-gray-200 border border-white/5'
                                    : 'bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/20'
                                    }`}>
                                    <div className="whitespace-pre-wrap break-words">
                                        {m.content.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
                                            part.match(/^https?:\/\//)
                                                ? <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline decoration-[#76b900]/40 hover:text-white transition-colors">{part}</a>
                                                : part
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-[#76b900]/10 text-[#76b900] flex items-center justify-center text-[10px]">
                                    <i className="fa-solid fa-ghost"></i>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-[#76b900] rounded-full animate-bounce"></div>
                                        <div className="w-1 h-1 bg-[#76b900] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1 h-1 bg-[#76b900] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/10 bg-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Request System Action..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#76b900] transition-all"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1.5 p-1 text-[#76b900] hover:text-white transition-colors"
                            >
                                <i className="fa-solid fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setInput("Show Keys")} className="text-[7px] orbitron bg-white/5 hover:bg-white/10 text-gray-500 hover:text-[#76b900] px-2 py-1 rounded border border-white/5 uppercase">Node_Keys</button>
                            <button onClick={() => setInput("Fuel Status")} className="text-[7px] orbitron bg-white/5 hover:bg-white/10 text-gray-500 hover:text-[#76b900] px-2 py-1 rounded border border-white/5 uppercase">Fuel_Level</button>
                            <button onClick={() => setInput("Deployment Plan")} className="text-[7px] orbitron bg-white/5 hover:bg-white/10 text-gray-500 hover:text-[#76b900] px-2 py-1 rounded border border-white/5 uppercase">Deploy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Orb */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative group ${isOpen
                    ? 'bg-black border border-[#76b900] rotate-90 scale-90'
                    : 'bg-[#76b900] shadow-[0_0_30px_rgba(118,185,0,0.4)] hover:shadow-[0_0_50px_rgba(118,185,0,0.6)] hover:scale-110'
                    }`}
            >
                <div className={`absolute inset-0 rounded-full border-2 border-[#76b900]/30 animate-ping ${isOpen ? 'hidden' : ''}`}></div>
                <i className={`fa-solid ${isOpen ? 'fa-terminal' : 'fa-ghost'} text-xl ${isOpen ? 'text-[#76b900]' : 'text-black'}`}></i>

                {/* Tooltip */}
                {!isOpen && (
                    <div className="absolute right-[110%] top-1/2 -translate-y-1/2 bg-black border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="orbitron text-[8px] font-black text-[#76b900] uppercase tracking-widest italic">Tactical Assistant Online</span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default TacticalAssistant;
