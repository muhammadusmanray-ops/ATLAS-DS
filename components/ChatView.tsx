
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/gemini';
import { llmAdapter } from '../services/llm';

interface ChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useFastMode, setUseFastMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input, type: 'text', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = "";
      const currentConfig = llmAdapter.getConfig();

      if (currentConfig.provider === 'openai-compatible' || !useFastMode) {
        // Enforce Groq/Llama for Tactical Mode
        const sysPrompt = "You are ATLAS-X, a robotic Data Science Combat Intelligence. Tone: Robotic, tactical, professional but MULTILINGUAL. You MUST understand Roman Urdu, Hinglish, and colloquial slang. Respond in a mix of English and Roman Urdu if the user does.";

        // Pass the last 10 messages as history for memory
        const history = messages.slice(-10).map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content
        }));

        console.log("SENDING TO GROQ ADAPTER...");
        const res = await llmAdapter.chat(input, sysPrompt, history as any);
        responseText = res?.text || "NO_DATA_RECEIVED";
      } else {
        // useFastMode = true -> Gemini Lite
        console.log("SENDING TO GEMINI SERVICE...");
        const response = await geminiService.fastChat(input);
        responseText = response.text || "";
      }

      const modelMsg: Message = {
        role: 'model',
        content: responseText || "PROTOCOL_FAILURE: Empty response from Neural Core.",
        type: 'text',
        timestamp: new Date(),
        metadata: { provider: useFastMode ? 'gemini' : 'groq' }
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "CRITICAL_ERROR: Handshake lost.", type: 'text', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCoreColor = (idx: number, msg: Message) => {
    if (msg.role === 'user') return '';
    const provider = msg.metadata?.provider || (useFastMode ? 'gemini-lite' : 'gemini-pro');
    if (provider === 'openai-compatible') return '#76b900'; // Nvidia Green for Groq
    return '#00f3ff'; // Tactical Blue for Gemini
  };

  const getCoreLabel = (idx: number, msg: Message) => {
    const provider = msg.metadata?.provider;
    if (provider === 'openai-compatible') return 'GROQ_CORE (NV_POWER)';
    return useFastMode ? 'GEMINI_LITE' : 'GEMINI_TACTICAL';
  };

  return (
    <div className="flex flex-col h-full bg-[#020203]">
      {/* Mode Toggle Header */}
      <div className="px-6 pt-4 flex justify-center">
        <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setUseFastMode(false)}
            className={`px-4 py-2 rounded-lg text-[10px] orbitron font-bold uppercase tracking-widest transition-all ${!useFastMode ? 'bg-[#76b900] text-black shadow-[0_0_10px_rgba(118,185,0,0.4)]' : 'text-gray-500 hover:text-white'
              }`}
          >
            <i className="fa-solid fa-brain mr-2"></i> Tactical (Pro)
          </button>
          <button
            onClick={() => setUseFastMode(true)}
            className={`px-4 py-2 rounded-lg text-[10px] orbitron font-bold uppercase tracking-widest transition-all ${useFastMode ? 'bg-[#ff00ff] text-black shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'text-gray-500 hover:text-white'
              }`}
          >
            <i className="fa-solid fa-bolt mr-2"></i> Rapid (Lite)
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-8 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'model' && (
                <div
                  style={{ backgroundColor: getCoreColor(idx, msg), boxShadow: `0 0 15px ${getCoreColor(idx, msg)}66` }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-black shrink-0 border border-white/10`}
                >
                  <i className={`fa-solid ${msg.metadata?.provider === 'openai-compatible' ? 'fa-microchip' : 'fa-robot'} text-sm`}></i>
                </div>
              )}
              <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-green-600/10 border border-green-500/20 text-green-50 rounded-tr-none'
                : 'bg-white/5 border border-white/10 text-gray-200 shadow-2xl rounded-tl-none'
                }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* TACTICAL DATASET CARD DETECTION */}
                {msg.role === 'model' && (msg.content.includes('kaggle.com/datasets') || msg.type === 'dataset') && (
                  <div className="mt-6 bg-black/60 border border-yellow-500/20 rounded-2xl overflow-hidden relative group/card">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black">
                          <i className="fa-brands fa-kaggle text-lg"></i>
                        </div>
                        <div>
                          <h4 className="text-[10px] orbitron font-bold text-yellow-400 uppercase tracking-widest">Dataset Intel Node</h4>
                          <p className="text-[8px] text-gray-500 font-mono italic">Source: Kaggle Repository</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[7px] text-green-500 font-bold uppercase">Public</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* PREVIEW SIMULATION */}
                      <div className="bg-black/80 rounded-lg border border-white/5 p-3 overflow-x-auto custom-scrollbar">
                        {/* TABLE CONTENT ... (omitted for brevity but kept in mind) */}
                        <p className="text-[9px] text-[#76b900] font-mono mb-2">SCANNING DATA_TABS...</p>
                        <table className="w-full text-[8px] font-mono text-left border-collapse">
                          <thead>
                            <tr className="text-gray-600 border-b border-white/5">
                              <th className="p-1">FEATURE</th>
                              <th className="p-1 text-right">METRIC</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-white/5">
                              <td className="p-1">LATENCY</td>
                              <td className="p-1 text-right text-green-500">LOW</td>
                            </tr>
                            <tr>
                              <td className="p-1">SAMPLES</td>
                              <td className="p-1 text-right">102.5k</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <a
                        href={msg.content.match(/https?:\/\/[^\s]+/)?.[0] || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-yellow-500 text-black rounded-xl text-[9px] orbitron font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all shadow-xl"
                      >
                        <i className="fa-solid fa-cloud-arrow-down"></i> Download_Source
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-[8px] opacity-30 orbitron tracking-[0.2em] uppercase flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.role === 'model' && (
                    <span style={{ color: getCoreColor(idx, msg) }} className="font-black italic">
                      {getCoreLabel(idx, msg)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2.5 items-center pl-14 opacity-40">
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'}`}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'}`}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'}`}></div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 md:p-10 border-t border-white/5 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-md">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#76b900]/20 to-[#00f3ff]/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <textarea
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
                e.currentTarget.style.height = 'auto';
              }
            }}
            placeholder={useFastMode ? "Direct link to Rapid Logic Cluster..." : "Send tactical DS instruction to ATLAS-X..."}
            className={`relative w-full bg-[#050508] border rounded-2xl p-4 md:p-5 pr-16 outline-none text-sm transition-all resize-none max-h-60 custom-scrollbar ${useFastMode
              ? 'border-[#ff00ff]/20 focus:border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.05)]'
              : 'border-white/10 focus:border-[#76b900] shadow-[0_0_20px_rgba(118,185,0,0.05)]'
              }`}
            style={{ height: '64px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 bottom-3 md:right-4 md:bottom-4 w-10 h-10 text-black rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'
              }`}
          >
            <i className="fa-solid fa-arrow-up text-sm"></i>
          </button>
        </div>
        <p className="text-[8px] text-center mt-4 text-gray-700 orbitron tracking-[0.4em] uppercase opacity-50 font-bold">
          Encrypted Neural Relay | {new Date().getFullYear()} Atlas-X Protocol
        </p>
      </div>
    </div>
  );
};

export default ChatView;
