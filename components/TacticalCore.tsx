import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/gemini';
import { llmAdapter } from '../services/llm';
import { UIConfig } from './UIAdjuster';

export interface TacticalCoreProps {
  messages: any[];
  setMessages: any;
  uiConfig: any;
}

const TacticalCore = ({ messages, setMessages, uiConfig }: any) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useFastMode, setUseFastMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input, type: 'text', timestamp: new Date() };
    setMessages((prev: any) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = "";
      const currentConfig = llmAdapter.getConfig();

      // Tactical Core always uses powerful logic. Enforce TACTICAL_FORMAT via prompt.
      if (currentConfig.provider === 'openai-compatible' || !useFastMode) {
        const sysPrompt = `You are ATLAS-X, a high-performance tactical AI. 
        CRITICAL_INSTRUCTIONS:
        1. Use technical, robotic tone.
        2. When providing DATASETS or LINKS, wrap them in [INTEL_LINK: URL] format.
        3. Use code blocks for all logic/math scripts.
        4. Keep words distinct and clear. Avoid overly dense paragraphs.
        5. Format as follows: **HEADING** -> Detailed Intelligence.`;

        const history = messages.slice(-10).map((m: any) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content
        }));

        const res = await llmAdapter.chat(input, sysPrompt, history as any);
        responseText = res?.text || "COMM_ERROR: HANDSHAKE_FAILED";
      } else {
        const response = await geminiService.fastChat(input);
        responseText = response.text || "";
      }

      const modelMsg: Message = {
        role: 'model',
        content: responseText || "Handshake lost. Please try again.",
        type: 'text',
        timestamp: new Date(),
        metadata: { provider: useFastMode ? 'gemini' : 'groq' }
      };
      setMessages((prev: any) => [...prev, modelMsg]);
    } catch (err) {
      setMessages((prev: any) => [...prev, { role: 'model', content: "CRITICAL_NEURAL_LINK_FAILURE", type: 'text', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
      // Re-focus input after processing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const renderContent = (content: string) => {
    // TACTICAL INTELLIGENCE PARSER
    const parts = content.split(/(```[\s\S]*?```|\*\*.*?\*\*|\[INTEL_LINK:.*?\]|https?:\/\/[^\s]+)/g);

    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('```')) {
        const code = part.replace(/```/g, '').trim();
        return (
          <div key={i} className="my-6 bg-black/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
              <span className="text-[8px] orbitron font-black text-gray-400 tracking-widest uppercase">Code_Payload</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(code);
                }}
                className="text-[8px] orbitron text-[#76b900] hover:text-white transition-colors"
              >
                Copy_Intel
              </button>
            </div>
            <pre className="p-6 text-[12px] font-mono text-green-400 overflow-x-auto custom-scrollbar leading-relaxed">
              {code}
            </pre>
          </div>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#76b900] orbitron font-black uppercase tracking-widest text-[13px]">{part.replace(/\*\*/g, '')}</strong>;
      }
      if (part.startsWith('[INTEL_LINK:') || part.match(/^https?:\/\//)) {
        const url = part.replace('[INTEL_LINK:', '').replace(']', '').trim();
        return (
          <div key={i} className="my-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-5 py-3.5 bg-[#76b900]/10 border border-[#76b900]/20 rounded-2xl text-[#76b900] font-black orbitron text-[10px] tracking-widest hover:bg-[#76b900] hover:text-black transition-all group shadow-[0_0_15px_rgba(118,185,0,0.1)] hover:shadow-[0_0_25px_rgba(118,185,0,0.3)]">
              <div className="w-8 h-8 rounded-lg bg-[#76b900]/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                <i className="fa-solid fa-satellite-dish animate-pulse"></i>
              </div>
              <div className="flex flex-col">
                <span className="leading-none">ACCESS_INTEL_DATABASE</span>
                <span className="text-[7px] text-gray-500 group-hover:text-black/60 truncate max-w-[200px] mt-1 italic uppercase font-mono">{url}</span>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square text-[8px] ml-2 opacity-40 group-hover:opacity-100 transition-opacity"></i>
            </a>
          </div>
        );
      }
      return <span key={i} className="whitespace-pre-wrap text-[15px] font-medium leading-[1.8] tracking-wide">{part}</span>;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020203] relative overflow-hidden">
      {/* TACTICAL HUD HEADER */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050508]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${useFastMode ? 'bg-white shadow-[0_0_5px_#ffffff]' : 'bg-[#76b900]'}`}></div>
          <span className="orbitron text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Tactical_Relay</span>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 shadow-inner">
          <button
            onClick={() => setUseFastMode(false)}
            className={`px-5 py-2 rounded-lg text-[9px] orbitron font-black transition-all uppercase tracking-widest ${!useFastMode ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
          >
            Nvidia_Logic (Groq)
          </button>
          <button
            onClick={() => setUseFastMode(true)}
            className={`px-5 py-2 rounded-lg text-[9px] orbitron font-black transition-all uppercase tracking-widest ${useFastMode ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
          >
            Rapid_Inference
          </button>
        </div>
      </div>

      {/* MESSAGES AREA - FLUID SCROLL */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-10 scroll-smooth relative"
      >
        <div className="max-w-4xl mx-auto space-y-10 pb-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all ${msg.role === 'user' ? 'bg-[#76b900] text-black border-[#76b900]/50' : 'bg-white/5 text-[#76b900] border-white/10'}`}>
                  <i className={`fa-solid ${msg.role === 'user' ? 'fa-user-ghost' : 'fa-robot'} text-sm`}></i>
                </div>
                <div className="space-y-4">
                  <div className={`p-6 rounded-3xl text-[15px] border selection:bg-[#76b900] selection:text-black shadow-2xl transition-all ${msg.role === 'user' ? 'bg-[#76b900]/10 border-[#76b900]/20 text-white' : 'bg-[#0a0a0b] border-white/5 text-gray-200 hover:border-white/10'}`}>
                    {renderContent(msg.content)}
                  </div>
                  <div className={`flex items-center gap-2 px-1 opacity-20 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[8px] font-black orbitron tracking-tighter uppercase">{msg.role === 'user' ? 'Commander' : 'Atlas-X'}</span>
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                    <span className="text-[8px] font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 items-center pl-14 opacity-40">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[9px] orbitron tracking-[0.2em] font-black uppercase">Sequencing...</span>
            </div>
          )}
        </div>
      </div>

      {/* TACTICAL INPUT AREA - FLEX FLOW FOR MOBILE STABILITY */}
      <div className="p-4 md:p-8 bg-[#020203] border-t border-white/5 relative z-30">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#76b900]/10 to-transparent rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 250) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="How can Atlas-X assist you today?"
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-[1.8rem] py-5 px-7 pr-20 outline-none text-[16px] leading-relaxed transition-border resize-none custom-scrollbar shadow-2xl text-white focus:border-[#76b900]/60 placeholder:text-white/5 font-medium"
            style={{ minHeight: '68px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3.5 bottom-3.5 w-11 h-11 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-10 z-10"
          >
            <i className="fa-solid fa-arrow-up text-base"></i>
          </button>
        </div>
        <div className="text-[8px] text-center mt-4 text-white/5 orbitron tracking-[0.4em] uppercase font-black pointer-events-none hidden md:block">
          Atlas-X Intelligence Node | Neural Hub
        </div>
      </div>
    </div>
  );
};

export default TacticalCore;
