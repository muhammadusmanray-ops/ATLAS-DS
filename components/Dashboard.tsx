
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const metrics = [
    { label: 'Neural Throughput', value: '42.8 GB/s', trend: '+5.4', color: 'text-[#76b900]', glow: 'shadow-[#76b900]/20' },
    { label: 'Intelligence Index', value: '98.4%', trend: '+0.2%', color: 'text-[#00f3ff]', glow: 'shadow-[#00f3ff]/20' },
    { label: 'Inference Latency', value: '0.04 ms', trend: '-12%', color: 'text-green-400', glow: 'shadow-green-400/20' },
    { label: 'Signal Integrity', value: '99.99%', trend: 'OPTIMAL', color: 'text-emerald-400', glow: 'shadow-emerald-400/20' },
  ];

  const recentOps = [
    { title: 'Neural Forensics Audit', status: 'Active', time: '2m ago', icon: 'fa-microchip', view: AppView.AUTO_EDA, desc: 'Visual HUD Analysis', color: 'text-[#76b900]', engine: 'Groq_LP' },
    { title: 'Dataset Forensics V-09', status: 'Standby', time: '1h ago', icon: 'fa-shield-halved', view: AppView.DATA_CLEANER, desc: 'Deep Sector Cleaning', color: 'text-[#76b900]', engine: 'Groq_LP' },
    { title: 'Vision Intelligence Scan', status: 'Completed', time: '4h ago', icon: 'fa-crosshairs', view: AppView.VISION, desc: 'Multimodal Intel Scan', color: 'text-[#00f3ff]', engine: 'Gemini_MM' },
  ];

  const systemStatus = [
    { name: 'GROQ_CORE_01', model: 'Llama-3-70B', status: 'ONLINE', usage: 'High-Speed Logic', color: '#76b900' },
    { name: 'GEMINI_ULTRA', model: 'Gemini-1.5-Pro', status: 'ACTIVE', usage: 'Complex Reasoning', color: '#00f3ff' },
    { name: 'NEXUS_VISION', model: '1.5-Flash-MM', status: 'ONLINE', usage: 'Visual Forensics', color: '#00f3ff' },
    { name: 'KERNEL_ISOLATION', model: 'V-Py v3.11', status: 'SECURE', usage: 'Code Execution', color: '#76b900' },
  ];

  return (
    <div className="flex flex-col p-8 md:p-12 bg-[#020204] relative selection:bg-[#76b900] selection:text-black">
      {/* HUD Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#76b900 1px, transparent 1px), linear-gradient(90deg, #76b900 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#76b900]/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full space-y-12 relative z-10">

        {/* Header Command Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-[#76b900] shadow-[0_0_20px_#76b900] rounded-full"></div>
              <h1 className="text-5xl font-black text-white orbitron tracking-[0.2em] uppercase italic drop-shadow-2xl">Mission<span className="text-[#76b900]">_Control</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-gray-600 font-bold font-mono text-[9px] uppercase tracking-[0.4em] italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></span>
                Neural_Status: <span className="text-[#76b900]">LINK_STABLE</span>
              </p>
              <div className="h-3 w-px bg-white/10"></div>
              <p className="text-gray-600 font-bold font-mono text-[9px] uppercase tracking-[0.4em] italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-pulse"></span>
                Engine_Protocol: <span className="text-[#00f3ff]">DUAL_H_25</span>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => onViewChange(AppView.CHAT)}
              className="bg-[#76b900] text-black px-10 py-4 rounded-2xl font-black orbitron text-[11px] tracking-[0.3em] uppercase hover:bg-white transition-all shadow-[0_10px_40px_rgba(118,185,0,0.3)] active:scale-95 flex items-center gap-3 border border-transparent hover:border-[#76b900]"
            >
              <i className="fa-solid fa-bolt-lightning text-lg"></i> Tactical Relay
            </button>
          </div>
        </div>

        {/* Metrics Grid Alpha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className={`bg-white/[0.03] border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all group backdrop-blur-2xl shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] orbitron font-black text-gray-500 uppercase tracking-widest">{m.label}</span>
                <div className={`flex items-center gap-1.5 text-[10px] font-black orbitron ${m.trend.startsWith('+') ? 'text-green-500' : 'text-[#76b900]'}`}>
                  <i className={`fa-solid ${m.trend.startsWith('+') ? 'fa-arrow-trend-up' : 'fa-check-double'}`}></i>
                  {m.trend}
                </div>
              </div>
              <div className={`text-3xl font-black orbitron ${m.color} group-hover:scale-105 transition-transform origin-left drop-shadow-lg`}>
                {m.value}
              </div>
              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-current opacity-20 animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Command Sectors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Sector: Strategic Ops */}
          <div className="lg:col-span-8 space-y-10">

            {/* Tactical Shortcuts */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs orbitron font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <i className="fa-solid fa-crosshairs text-[#76b900]"></i> Tactical Deployment Hub
                </h3>
                <span className="text-[9px] text-gray-700 font-mono uppercase tracking-[0.4em] font-bold">Priority Execution Nodes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentOps.map((op, i) => (
                  <button
                    key={i}
                    onClick={() => onViewChange(op.view)}
                    className="w-full text-left bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-white/[0.08] hover:border-[#76b900]/30 transition-all group shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={`w-16 h-16 rounded-[20px] bg-black/40 flex items-center justify-center ${op.color} border border-white/5 group-hover:border-current transition-all shadow-2xl`}>
                        <i className={`fa-solid ${op.icon} text-2xl group-hover:scale-120 transition-transform`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[8px] orbitron font-black text-gray-500 uppercase tracking-widest">{op.engine}</span>
                          <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                          <span className="text-[8px] orbitron font-black text-green-500 uppercase tracking-widest">{op.status}</span>
                        </div>
                        <h4 className="text-sm font-black text-white orbitron tracking-[0.1em] uppercase group-hover:text-[#76b900] transition-colors">{op.title}</h4>
                        <p className="text-[9px] text-gray-600 mt-1 uppercase font-black tracking-widest leading-relaxed">{op.desc}</p>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${op.color} opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-2`}>
                      <i className="fa-solid fa-chevron-right"></i>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                      <i className={`fa-solid ${op.icon} text-6xl`}></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Neural Matrix Architecture */}
            <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden backdrop-blur-3xl group/matrix">
              <div className="absolute inset-0 bg-gradient-to-br from-[#76b900]/5 to-transparent opacity-0 group-hover/matrix:opacity-100 transition-opacity duration-1000"></div>
              <div className="absolute -top-32 -right-32 opacity-[0.03] pointer-events-none group-hover/matrix:rotate-12 transition-transform duration-1000">
                <i className="fa-solid fa-network-wired text-[400px] text-white"></i>
              </div>

              <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-xs orbitron font-black text-[#76b900] uppercase tracking-[0.4em] flex items-center gap-4">
                  <div className="p-2 bg-[#76b900]/10 rounded-lg">
                    <i className="fa-solid fa-microchip"></i>
                  </div>
                  System_Infrastructure_Matrix
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-[9px] font-black orbitron text-gray-600 uppercase tracking-widest">Global_Status: <span className="text-green-500">OPTIMAL</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {systemStatus.map((sys, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-black/60 rounded-[32px] border border-white/5 group/sys hover:border-current transition-all shadow-inner" style={{ color: sys.color }}>
                    <div className="flex items-center gap-5">
                      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: sys.color }}></div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-white orbitron uppercase tracking-widest">{sys.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black orbitron uppercase tracking-widest" style={{ color: sys.color }}>{sys.model}</span>
                          <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">/ {sys.usage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border shadow-lg group-hover/sys:scale-105 transition-all tracking-[0.1em]`}
                        style={{ backgroundColor: `${sys.color}15`, color: sys.color, borderColor: `${sys.color}30` }}>
                        {sys.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sector: Global Intelligence Feed */}
          <div className="lg:col-span-4 space-y-8 flex flex-col">
            {/* Core Intel Card */}
            <div className="bg-gradient-to-br from-[#76b900]/20 to-transparent border border-[#76b900]/30 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-atom text-[100px] text-white"></i>
              </div>
              <div className="w-16 h-16 rounded-[24px] bg-[#76b900] flex items-center justify-center text-black mb-10 shadow-[0_15px_40px_rgba(118,185,0,0.4)]">
                <i className="fa-solid fa-bolt-lightning text-2xl"></i>
              </div>
              <h4 className="text-white font-black orbitron text-sm uppercase tracking-[0.2em] mb-6">Dual Intelligence Architecture</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono uppercase tracking-wider">
                ATLAS-X has evolved into a multispectral intelligence hub.
                <br /><br />
                <span className="text-[#76b900] font-black tracking-[0.2em]">■ GREEN_ENGINE</span><br />
                <span className="text-[10px] text-gray-600 font-bold">GROQ_POWERED HIGH-SPEED INFERENCE (LLAMA-3).</span>
                <br /><br />
                <span className="text-[#00f3ff] font-black tracking-[0.2em]">■ BLUE_ENGINE</span><br />
                <span className="text-[10px] text-gray-600 font-bold">GEMINI_POWERED MULTIMODAL REASONING.</span>
              </p>
            </div>

            {/* Neural Telemetry Feed */}
            <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 flex flex-col flex-1 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-10 relative z-10">
                <span className="text-[10px] orbitron font-black text-gray-500 uppercase tracking-[0.4em]">Live_Uplink_Stream</span>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse delay-150"></div>
                </div>
              </div>

              <div className="space-y-10 relative z-10 overflow-y-auto custom-scrollbar pr-4">
                {[
                  { time: 'T-MS: 402', msg: 'Satellite handshake verified. Groq inference nodes at 100% efficiency.', icon: 'fa-satellite' },
                  { time: 'T-MS: 1204', msg: 'Gemini multimodal pipeline synchronized for vision sector scan.', icon: 'fa-eye' },
                  { time: 'T-MS: 2890', msg: 'Data Forensics quarantine active. Analyzing sector V-BR-09 for anomalies.', icon: 'fa-biohazard' }
                ].map((log, i) => (
                  <div key={i} className="relative pl-8 border-l-2 border-[#76b900]/20 group/log">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#020204] border-2 border-[#76b900]/30 flex items-center justify-center group-hover/log:border-[#76b900] transition-colors">
                      <div className="w-1 h-1 bg-[#76b900] rounded-full group-hover/log:scale-150 transition-transform"></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <i className={`fa-solid ${log.icon} text-[10px] text-[#76b900] opacity-50`}></i>
                        <p className="text-[9px] text-[#76b900]/60 font-black orbitron uppercase tracking-[0.3em]">{log.time}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-bold uppercase tracking-tight group-hover/log:text-white transition-colors">
                        {log.msg}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] orbitron font-black text-gray-700 uppercase tracking-[0.5em]">Command_ID: X-901-T</span>
                  <span className="text-[8px] orbitron font-black text-gray-700 uppercase tracking-[0.5em]">Rev: 4.8.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
