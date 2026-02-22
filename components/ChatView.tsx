import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/gemini';
import { llmAdapter } from '../services/llm';
import { UIConfig } from './UIAdjuster';

export interface TacticalChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  uiConfig: UIConfig;
}

const ChatView = ({ messages, setMessages, uiConfig }: TacticalChatProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useFastMode, setUseFastMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = "";
      const currentConfig = llmAdapter.getConfig();

      // Tactical Core always uses the powerful Groq-driven logic unless explicitly toggled
      if (currentConfig.provider === 'openai-compatible' || !useFastMode) {
        const sysPrompt = "You are ATLAS-X, a high-performance tactical AI powered by Nvidia Logic. Respond with extreme technical precision and a dark, high-tech persona.";
        const history = messages.slice(-10).map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content
        }));

        const res = await llmAdapter.chat(input, sysPrompt, history as any);
        responseText = res?.text || "COMMUNICATION_ERROR: HANDSHAKE_FAILED";
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
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "CRITICAL_NEURAL_LINK_FAILURE", type: 'text', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
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
        className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-10 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto space-y-10 pb-40">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all ${msg.role === 'user' ? 'bg-[#76b900] text-black border-[#76b900]/50' : 'bg-white/5 text-[#76b900] border-white/10'}`}>
                  <i className={`fa-solid ${msg.role === 'user' ? 'fa-user-ghost' : 'fa-robot'} text-sm`}></i>
                </div>
                <div className="space-y-2">
                  <div className={`p-5 rounded-2xl text-[15px] leading-relaxed border selection:bg-[#76b900] selection:text-black ${msg.role === 'user' ? 'bg-[#76b900]/10 border-[#76b900]/20 text-white' : 'bg-[#0a0a0b] border-white/5 text-gray-200'}`}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-2 px-1 opacity-20 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[8px] font-black orbitron tracking-tighter uppercase">{msg.role === 'user' ? 'Commander' : 'Atlas-X'}</span>
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                    <span className="text-[8px] font-mono">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

      {/* FIXED TACTICAL INPUT AREA - CHATGPT STYLE */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-[#020203] via-[#020203]/95 to-transparent z-[100]">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#76b900]/20 to-transparent rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-700"></div>
          <textarea
            value={input}
            rows={1}
            autoFocus
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
            className="w-full bg-[#111113] border border-white/10 rounded-[1.8rem] py-5 px-7 pr-20 outline-none text-[16px] leading-relaxed transition-all resize-none custom-scrollbar shadow-2xl text-white focus:border-[#76b900]/40 placeholder:text-white/10 font-medium"
            style={{ minHeight: '68px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3.5 bottom-3.5 w-11 h-11 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-10"
          >
            <i className="fa-solid fa-arrow-up text-base"></i>
          </button>
        </div>
        <div className="text-[10px] text-center mt-4 text-white/5 orbitron tracking-[0.4em] uppercase font-black pointer-events-none">
          Atlas-X Intelligence Node | Neural Hub
        </div>
      </div>
    </div>
  );
};

export default ChatView;
