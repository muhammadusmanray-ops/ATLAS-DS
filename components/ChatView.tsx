
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/gemini';

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
      const response = useFastMode 
        ? await geminiService.fastChat(input) 
        : await geminiService.chat(input);

      const modelMsg: Message = {
        role: 'model',
        content: response.text || "PROTOCOL_FAILURE: Intelligence nodes unresponsive.",
        type: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "CRITICAL_ERROR: Handshake lost.", type: 'text', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020203]">
      {/* Mode Toggle Header */}
      <div className="px-6 pt-4 flex justify-center">
        <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setUseFastMode(false)}
            className={`px-4 py-2 rounded-lg text-[10px] orbitron font-bold uppercase tracking-widest transition-all ${
              !useFastMode ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]' : 'text-gray-500 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-brain mr-2"></i> Tactical (Pro)
          </button>
          <button
            onClick={() => setUseFastMode(true)}
            className={`px-4 py-2 rounded-lg text-[10px] orbitron font-bold uppercase tracking-widest transition-all ${
              useFastMode ? 'bg-[#ff00ff] text-black shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'text-gray-500 hover:text-white'
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-black shrink-0 shadow-[0_0_10px_rgba(0,243,255,0.4)] ${useFastMode && idx === messages.length - 1 ? 'bg-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'bg-[#00f3ff]'}`}>
                  <i className={`fa-solid ${useFastMode && idx === messages.length - 1 ? 'fa-bolt' : 'fa-robot'} text-sm`}></i>
                </div>
              )}
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50' 
                  : 'bg-white/5 border border-white/10 text-gray-200'
              }`}>
                {msg.content}
                <div className="mt-2 text-[8px] opacity-30 orbitron tracking-widest uppercase flex justify-between">
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.role === 'model' && idx === messages.length - 1 && (
                      <span className={useFastMode ? "text-[#ff00ff]" : "text-[#00f3ff]"}>
                        {useFastMode ? 'LITE CORE' : 'PRO CORE'}
                      </span>
                    )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 items-center opacity-50">
                <div className={`w-2 h-2 rounded-full animate-bounce ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#00f3ff]'}`}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce delay-75 ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#00f3ff]'}`}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce delay-150 ${useFastMode ? 'bg-[#ff00ff]' : 'bg-[#00f3ff]'}`}></div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40">
        <div className="max-w-3xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={useFastMode ? "Rapid query input..." : "Ask ATLAS-X for tactical DS insights..."}
            className={`w-full bg-white/5 border rounded-2xl p-4 pr-16 outline-none text-sm transition-all resize-none h-14 ${
              useFastMode 
              ? 'border-[#ff00ff]/20 focus:border-[#ff00ff] focus:ring-1 focus:ring-[#ff00ff]' 
              : 'border-white/10 focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff]'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 top-3 w-8 h-8 text-black rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale ${
              useFastMode ? 'bg-[#ff00ff]' : 'bg-[#00f3ff]'
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
