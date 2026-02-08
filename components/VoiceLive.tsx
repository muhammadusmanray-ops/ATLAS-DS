
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { encode, decode, decodeAudioData, geminiService } from '../services/gemini';

const VoiceLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [transcription, setTranscription] = useState<string[]>([]);
  
  // --- TACTICAL METRICS ---
  const [seconds, setSeconds] = useState(0);
  const [tokenUsage, setTokenUsage] = useState(0);
  
  // Constants for estimation
  // Audio Input (~16khz) + Output (~24khz) is heavy. 
  // Approx 200-300 tokens per second of active conversation is a safe buffer estimate.
  const TOKENS_PER_SECOND = 250; 
  const FREE_TIER_DAILY_LIMIT = 1_000_000; // Rough token equivalent for safe usage/day
  
  const audioContext = useRef<AudioContext | null>(null);
  const nextStartTime = useRef<number>(0);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
      return () => {
          if(timerRef.current) clearInterval(timerRef.current);
          stopSession();
      }
  }, []);

  const startSession = async () => {
    setIsActive(true);
    setStatus('connecting');
    setSeconds(0);
    setTokenUsage(0);

    // Start Tactical Timer
    timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
        setTokenUsage(t => t + TOKENS_PER_SECOND); 
    }, 1000);
    
    // Create new GoogleGenAI instance right before connecting
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ 
                  media: { 
                      data: encode(new Uint8Array(int16.buffer)),
                      mimeType: 'audio/pcm;rate=16000' 
                  } 
                });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              const bytes = decode(audioData);
              const buffer = await decodeAudioData(bytes, audioContext.current!, 24000, 1);
              
              const source = audioContext.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContext.current!.destination);
              
              nextStartTime.current = Math.max(nextStartTime.current, audioContext.current!.currentTime);
              source.start(nextStartTime.current);
              nextStartTime.current += buffer.duration;
              sources.current.add(source);
              source.onended = () => {
                sources.current.delete(source);
                if (sources.current.size === 0) setStatus('listening');
              };
            }

            if (msg.serverContent?.interrupted) {
              sources.current.forEach(s => s.stop());
              sources.current.clear();
              nextStartTime.current = 0;
            }

            if (msg.serverContent?.outputTranscription) {
                setTranscription(prev => [...prev.slice(-2), msg.serverContent!.outputTranscription!.text]);
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: "You are ATLAS-X, a robotic Data Science Intelligence. Speak briefly, efficiently, and professionally. Use technical terminology."
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      stopSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    sources.current.forEach(s => s.stop());
    sources.current.clear();
  };

  const formatTime = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate percentage of daily "safe" quota used in this session
  const quotaUsedPercent = Math.min((tokenUsage / 100000) * 100, 100); 

  return (
    <div className="h-full flex flex-col relative bg-[#050508] overflow-hidden">
      {/* Background Grid & Cyber Effects */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* HUD HEADER */}
      <div className="relative z-10 flex justify-between items-start p-6 border-b border-[#00f3ff]/20 bg-black/40 backdrop-blur-sm">
        <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white orbitron tracking-tight">VOICE_UPLINK<span className="text-[#00f3ff] animate-pulse">_V2</span></h2>
            <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">SIGNAL: {status.toUpperCase()}</span>
            </div>
        </div>

        {/* Tactical Timer */}
        <div className="text-right">
            <div className="text-4xl font-mono font-bold text-[#00f3ff] drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]">
                {formatTime(seconds)}
            </div>
            <div className="text-[9px] text-gray-500 uppercase tracking-[0.3em]">Session Duration</div>
        </div>
      </div>

      {/* MAIN REACTOR CORE */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Central Button / Arc Reactor */}
        <div className="relative group">
            {/* Spinning Rings */}
            {isActive && (
                <>
                    <div className="absolute inset-0 rounded-full border border-[#00f3ff]/30 w-full h-full scale-150 animate-[spin_4s_linear_infinite]"></div>
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#00f3ff]/20 w-full h-full scale-125 animate-[spin_10s_linear_infinite_reverse]"></div>
                </>
            )}

            <button
                onClick={isActive ? stopSession : startSession}
                className={`relative z-20 w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 border-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
                isActive 
                    ? 'bg-black border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)]' 
                    : 'bg-[#00172D] border-[#00f3ff] hover:scale-105 hover:shadow-[0_0_60px_rgba(0,243,255,0.3)]'
                }`}
            >
                <i className={`fa-solid ${isActive ? 'fa-square' : 'fa-microphone'} text-4xl mb-3 ${isActive ? 'text-red-500' : 'text-[#00f3ff]'}`}></i>
                <span className={`text-[10px] font-black orbitron uppercase tracking-widest ${isActive ? 'text-red-500' : 'text-white'}`}>
                    {isActive ? 'TERMINATE' : 'INITIALIZE'}
                </span>
                
                {isActive && <div className="absolute bottom-10 text-[8px] font-mono text-red-500 animate-pulse">REC: ON AIR</div>}
            </button>
        </div>

        {/* Live Transcription Stream */}
        <div className="mt-12 w-full max-w-2xl px-6">
            <div className="bg-black/60 border-x border-[#00f3ff]/20 p-6 min-h-[100px] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00f3ff]"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00f3ff]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00f3ff]"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00f3ff]"></div>
                
                {transcription.length > 0 ? (
                    <p className="text-[#00f3ff] font-mono text-sm leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-bottom-2">
                        "{transcription[transcription.length - 1]}"
                    </p>
                ) : (
                    <p className="text-gray-600 font-mono text-xs uppercase tracking-widest animate-pulse">
                        {isActive ? 'Listening for audio input...' : 'Systems Standby. Awaiting handshake.'}
                    </p>
                )}
            </div>
        </div>
      </div>

      {/* FOOTER: FUEL GAUGE & STATS */}
      <div className="bg-black/80 border-t border-white/10 p-6 backdrop-blur-md">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Stat 1: Consumption */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Session Cost</span>
                    <span className="text-[#00f3ff] font-mono text-sm">{tokenUsage.toLocaleString()} <span className="text-[9px] text-gray-600">tokens</span></span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#00f3ff] transition-all duration-1000 shadow-[0_0_10px_#00f3ff]" 
                        style={{ width: `${quotaUsedPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* Stat 2: Quota Estimate */}
            <div className="flex flex-col gap-2 border-x border-white/5 px-8">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Daily Fuel (Est)</span>
                    <span className="text-white font-mono text-sm">{(100 - (tokenUsage / FREE_TIER_DAILY_LIMIT) * 100).toFixed(2)}%</span>
                </div>
                 <div className="flex gap-1 h-1.5">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={i} className={`flex-1 rounded-sm ${i <= 8 ? 'bg-green-500/50' : 'bg-red-500/50'}`}></div>
                    ))}
                </div>
            </div>

            {/* Stat 3: Est Time Left */}
            <div className="flex flex-col items-end justify-center">
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Est. Talk Time Remaining</span>
                 <span className="text-xl font-black orbitron text-white">~3.5 <span className="text-sm text-gray-600">HOURS</span></span>
            </div>

        </div>
      </div>
    </div>
  );
};

export default VoiceLive;
