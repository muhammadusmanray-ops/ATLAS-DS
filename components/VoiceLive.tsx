import React from 'react';
import { useMultimodalLive, LiveConnectionState } from '../hooks/useMultimodalLive';

interface VoiceLiveProps {
  sessionId: string | null;
  user: any;
  setGlobalMessages: (msgs: any[]) => void;
}

const VoiceLive: React.FC<VoiceLiveProps> = ({ sessionId, user, setGlobalMessages }) => {
  const { connect, disconnect, connectionState, messages, volume, activeNode, errorMsg, sessionDuration } = useMultimodalLive(sessionId, user, setGlobalMessages);

  const isActive = connectionState === LiveConnectionState.CONNECTED || connectionState === LiveConnectionState.CONNECTING;

  // REAL FUEL: 10 mins = 600 seconds
  const totalFuelSeconds = 600;
  const remainingFuelPercent = Math.max(5, 100 - (sessionDuration / totalFuelSeconds * 100));

  const toggleSession = () => {
    if (isActive) {
      disconnect();
    } else {
      connect();
    }
  };

  const currentMessage = messages[messages.length - 1];

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-black font-sans select-none">
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {/* STATUS INDICATOR */}
        <div className={`absolute top-8 left-8 flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-500 ${isActive ? 'bg-[#FFB800]/10 border-[#FFB800]/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#FFB800] animate-pulse shadow-[0_0_10px_#FFB800]' : 'bg-red-500 shadow-[0_0_10px_red]'}`}></div>
          <span className={`text-[10px] font-bold tracking-widest uppercase ${isActive ? 'text-[#FFB800]' : 'text-red-500'}`}>
            {connectionState} {isActive && `[NODE_0${activeNode}]`}
          </span>
        </div>

        {/* REAL FUEL GAUGE */}
        <div className="absolute top-8 right-8 w-48 space-y-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-[8px] font-black text-[#FFB800] tracking-widest uppercase">Node Fuel</span>
            <span className="text-[8px] font-mono text-gray-500">
              {Math.max(0, totalFuelSeconds - sessionDuration)}S REMAINING
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-[#FFB800] to-[#FFB800] transition-all duration-1000"
              style={{ width: `${remainingFuelPercent}%`, boxShadow: '0 0 10px #FFB800' }}
            ></div>
          </div>
        </div>

        {/* CORE INTERFACE - REACTOR */}
        <div className="relative group cursor-pointer" onClick={toggleSession}>
          {/* SPINNING RINGS */}
          <div className={`absolute inset-0 rounded-full border-2 border-[#FFB800]/20 transition-all duration-1000 ${isActive ? 'animate-[spin_4s_linear_infinite] scale-110' : 'scale-100'}`}></div>
          <div className={`absolute -inset-4 rounded-full border border-[#FFB800]/10 transition-all duration-1000 ${isActive ? 'animate-[spin_8s_linear_infinite_reverse] scale-125' : 'scale-100'}`}></div>

          {/* WAVEFORM ORB */}
          <div className={`w-56 h-56 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-500 relative overflow-hidden ${isActive ? 'bg-[#FFB800]/20 shadow-[0_0_120px_#FFB800]' : 'bg-white/5 border border-white/10'
            }`}>
            {/* DYNAMIC VOLUME VISUALIZER */}
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-60">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#FFB800] rounded-full transition-all duration-75"
                    style={{
                      height: `${20 + (volume * Math.random() * 80)}%`,
                      boxShadow: '0 0 15px #FFB800'
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* CENTER ICON */}
            <div className="z-10 bg-black/40 p-8 rounded-full border border-white/5 backdrop-blur-3xl">
              <i className={`fa-solid ${connectionState === LiveConnectionState.CONNECTING ? 'fa-spinner fa-spin' : (isActive ? 'fa-bolt-lightning' : 'fa-microphone-slash')} text-4xl transition-all ${isActive ? 'text-[#FFB800]' : 'text-gray-600'}`}></i>
            </div>

            {/* SCANNING LINE */}
            {isActive && <div className="absolute top-0 w-full h-1 bg-[#FFB800]/40 shadow-[0_0_20px_#FFB800] animate-[bounce_3s_infinite] opacity-50"></div>}
          </div>

          {!isActive && (
            <div className="absolute inset-x-0 -bottom-12 flex items-center justify-center">
              <span className="text-[10px] font-black tracking-[0.4em] text-white/40 group-hover:text-[#FFB800] transition-colors uppercase">Initialize Uplink</span>
            </div>
          )}
        </div>

        {/* TRANSCRIPT AREA */}
        <div className="mt-20 w-full max-w-2xl text-center space-y-6 min-h-[120px] px-4">
          <div className="bg-[#FFB800]/5 border border-[#FFB800]/10 p-6 rounded-[30px] backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFB800]/30 to-transparent"></div>

            {currentMessage ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <span className={`text-[8px] font-black tracking-widest uppercase ${currentMessage.role === 'user' ? 'text-gray-500' : 'text-[#FFB800]'}`}>
                  {currentMessage.role === 'user' ? 'Transmission Inbound' : 'Atlas-X Response'}
                </span>
                <p className={`text-lg font-bold orbitron leading-relaxed ${currentMessage.role === 'user' ? 'text-[#FFB800]/60 italic' : 'text-[#FFB800]'}`}>
                  {currentMessage.text}
                </p>
              </div>
            ) : (
              <p className="text-gray-700 italic font-mono text-sm tracking-widest uppercase">
                Waiting for Neural Sync...
              </p>
            )}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {(errorMsg || connectionState === LiveConnectionState.ERROR) && (
          <div className="absolute bottom-10 text-red-500 font-black text-[9px] bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            ⚠️ SYSTEM_FAULT: {errorMsg || "Neural Link Severed"}
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="absolute bottom-6 right-8 flex flex-col items-end gap-1 opacity-20 hover:opacity-100 transition-opacity">
        <span className="text-[8px] text-[#FFB800] tracking-[0.5em] font-black uppercase">Multimodal Live Engine v2.0</span>
        <span className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.3em]">Built for Muhammad Usman Ray</span>
      </div>
    </div >
  );
};

export default VoiceLive;
