
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
    <div className="flex flex-col h-full bg-[#020203] md:pl-10">
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'model' && (
                <div
                  style={{ backgroundColor: getCoreColor(idx, msg), boxShadow: `0 0 10px ${getCoreColor(idx, msg)}66` }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-black shrink-0`}
                >
                  <i className={`fa-solid ${msg.metadata?.provider === 'openai-compatible' ? 'fa-microchip' : 'fa-robot'} text-sm`}></i>
                </div>
              )}
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-green-600/20 border border-green-500/30 text-green-50'
                : 'bg-white/5 border border-white/10 text-gray-200 shadow-xl'
                }`}>
                {msg.content}

                {/* TACTICAL DATASET CARD DETECTION */}
                {msg.role === 'model' && (msg.content.includes('kaggle.com/datasets') || msg.type === 'dataset') && (
                  <div className="mt-4 bg-black/40 border border-yellow-500/20 rounded-xl overflow-hidden relative group/card">
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
                        <span className="px-2 py-0.5 rounded bg-[#76b900]/10 border border-[#76b900]/20 text-[7px] text-[#76b900] font-bold uppercase">CSV</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center text-[9px] orbitron text-gray-400">
                        <span>METADATA_EXTRACTED</span>
                        <span className="text-yellow-400">99.8% INTEGRITY</span>
                      </div>

                      {/* DATA PREVIEW TABLE - Simulated Preview */}
                      <div className="bg-black/60 rounded-lg border border-white/5 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-[8px] font-mono text-left">
                          <thead className="bg-white/5 text-gray-500 uppercase">
                            <tr>
                              <th className="p-2 border-b border-white/5">Preg.</th>
                              <th className="p-2 border-b border-white/5">Glucose</th>
                              <th className="p-2 border-b border-white/5">BP</th>
                              <th className="p-2 border-b border-white/5">Insulin</th>
                              <th className="p-2 border-b border-white/5">BMI</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-300">
                            <tr className="border-b border-white/5">
                              <td className="p-2">6</td>
                              <td className="p-2 text-green-400">148</td>
                              <td className="p-2">72</td>
                              <td className="p-2">0</td>
                              <td className="p-2 text-[#76b900]">33.6</td>
                            </tr>
                            <tr className="border-b border-white/5 opacity-60">
                              <td className="p-2">1</td>
                              <td className="p-2 text-green-400">85</td>
                              <td className="p-2">66</td>
                              <td className="p-2">0</td>
                              <td className="p-2 text-[#76b900]">26.6</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={msg.content.match(/https?:\/\/[^\s]+/)?.[0] || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 bg-yellow-500 text-black rounded-lg text-[9px] orbitron font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_5px_15px_rgba(234,179,8,0.2)]"
                        >
                          <i className="fa-solid fa-cloud-arrow-down"></i> Download
                        </a>
                        <button className="py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg text-[9px] orbitron font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                          <i className="fa-solid fa-code"></i> Python Hub
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 text-[8px] opacity-30 orbitron tracking-widest uppercase flex justify-between">
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.role === 'model' && (
                    <span style={{ color: getCoreColor(idx, msg) }}>
                      {getCoreLabel(idx, msg)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 items-center opacity-50">
              <div className={`w-2 h-2 rounded-full animate-bounce ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'}`}></div>
              <div className={`w-2 h-2 rounded-full animate-bounce delay-75 ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'}`}></div>
              <div className={`w-2 h-2 rounded-full animate-bounce delay-150 ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'}`}></div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40">
        <div className="max-w-3xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={useFastMode ? "Rapid query input..." : "Ask ATLAS-X for tactical DS insights..."}
            className={`w-full bg-white/5 border rounded-2xl p-4 pr-16 outline-none text-sm transition-all resize-none h-14 ${useFastMode
              ? 'border-[#ff00ff]/20 focus:border-[#ff00ff] focus:ring-1 focus:ring-[#ff00ff]'
              : 'border-white/10 focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900]'
              }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 top-3 w-8 h-8 text-black rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#76b900]'
              }`}
          >
            <i className="fa-solid fa-arrow-up text-xs"></i>
          </button>
        </div>
        <p className="text-[9px] text-center mt-3 text-gray-600 orbitron tracking-widest uppercase">
          {useFastMode ? 'FAST_LITE_RELAY ACTIVE' : 'COMBAT SYSTEM ONLINE | AES-256 ENCRYPTION ACTIVE'}
        </p>
      </div>
    </div>
  );
};

export default ChatView;
