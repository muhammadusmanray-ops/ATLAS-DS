
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const metrics = [
    { label: 'Models Deployed', value: '12', trend: '+2', color: 'text-[#00f3ff]' },
    { label: 'Data Vectors', value: '8.4M', trend: '+12%', color: 'text-[#ff00ff]' },
    { label: 'Compute Time', value: '142h', trend: '-5%', color: 'text-yellow-400' },
    { label: 'Accuracy Score', value: '94.2%', trend: '+0.8%', color: 'text-green-400' },
  ];

  // Made these clickable shortcuts mapping to real views
  const recentOps = [
    { title: 'Fraud Detection Pipeline', status: 'Deployed', time: '2h ago', icon: 'fa-shield-cat', view: AppView.AUTOML, desc: 'Jump to AutoML Lab' },
    { title: 'Customer Churn Analysis', status: 'Processing', time: '5h ago', icon: 'fa-users-slash', view: AppView.AUTO_EDA, desc: 'Jump to Intel Scan' },
    { title: 'Visual Defect Scan', status: 'Completed', time: '1d ago', icon: 'fa-eye', view: AppView.VISION, desc: 'Jump to Vision HUD' },
  ];

  // Updated status based on recent upgrades
  const systemStatus = [
    { name: 'Core Intelligence', model: 'Gemini 3 Pro', status: 'ONLINE', usage: 'Reasoning & Coding' },
    { name: 'Visual Cortex', model: 'Gemini 2.5 Flash', status: 'ONLINE', usage: 'Image Analysis' },
    { name: 'Auditory Sensor', model: 'Native Audio 12-25', status: 'ONLINE', usage: 'Real-time Voice' },
    { name: 'Tactical Maps', model: 'Google Maps Grounding', status: 'ONLINE', usage: 'Geospatial Data' },
    { name: 'Memory Bank', model: 'IndexedDB (Local)', status: 'SECURE', usage: 'Offline Storage' },
    { name: 'Search Uplink', model: 'Google Search Tool', status: 'ONLINE', usage: 'Live Web Data' },
  ];

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-[#020203]">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-4xl font-black text-white orbitron tracking-tight uppercase italic">Mission Control</h1>
            <p className="text-gray-500 mt-2 font-mono text-xs tracking-widest uppercase">System Status: <span className="text-[#00f3ff]">NOMINAL</span> | Region: <span className="text-gray-300">ASIA-SOUTH-1</span></p>
          </div>
          <div className="flex gap-4">
              <button 
                onClick={() => onViewChange(AppView.CHAT)}
                className="bg-[#00f3ff] text-black px-6 py-3 rounded-xl font-bold orbitron text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                <i className="fa-solid fa-terminal mr-2"></i> Open Terminal
              </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-[#00f3ff]/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] orbitron text-gray-500 uppercase tracking-widest">{m.label}</span>
                <span className={`text-[9px] font-mono ${m.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{m.trend}</span>
              </div>
              <div className={`text-3xl font-black orbitron ${m.color} group-hover:scale-110 transition-transform origin-left`}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Ops & Modules */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Operations (Now Clickable) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-sm orbitron font-bold text-gray-400 uppercase tracking-widest">Active Operations (Shortcuts)</h3>
                    <span className="text-[9px] text-gray-600 uppercase">Click to resume</span>
                </div>
                <div className="space-y-4">
                {recentOps.map((op, i) => (
                    <button 
                        key={i} 
                        onClick={() => onViewChange(op.view)}
                        className="w-full text-left bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 hover:border-[#00f3ff]/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:text-[#00f3ff] group-hover:border-[#00f3ff]/50 transition-colors">
                                <i className={`fa-solid ${op.icon}`}></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-200 group-hover:text-white">{op.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wide group-hover:text-[#00f3ff]">{op.desc}</span>
                                </div>
                            </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-600 text-xs group-hover:text-white group-hover:translate-x-1 transition-all"></i>
                    </button>
                ))}
                </div>
            </div>

            {/* Architecture Status Panel */}
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                 <h3 className="text-sm orbitron font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-network-wired text-[#00f3ff]"></i> API Uplink Matrix
                 </h3>
                 <p className="text-[9px] text-gray-500 mb-4 uppercase tracking-widest">
                    Single Key Accessing Distributed Neural Grid
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemStatus.map((sys, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-black rounded-lg border border-white/5 group hover:border-[#00f3ff]/30 transition-all">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-200 uppercase">{sys.name}</span>
                                <span className="text-[8px] text-[#00f3ff] font-mono">{sys.model}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                                    sys.status === 'ONLINE' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                                    sys.status === 'SECURE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                                    'bg-gray-500/10 text-gray-500 border-gray-500/30'
                                }`}>
                                    {sys.status}
                                </span>
                                <span className="text-[7px] text-gray-600 mt-1 uppercase">{sys.usage}</span>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Quick Actions Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => onViewChange(AppView.AUTO_EDA)} className="p-6 bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 rounded-2xl text-left hover:border-purple-500/50 transition-all group">
                    <i className="fa-solid fa-crosshairs text-2xl text-purple-400 mb-3 group-hover:scale-125 transition-transform"></i>
                    <h4 className="font-bold text-gray-200">Start Intel Scan</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Automated Exploratory Data Analysis</p>
                </button>
                <button onClick={() => onViewChange(AppView.DATA_CLEANER)} className="p-6 bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 rounded-2xl text-left hover:border-red-500/50 transition-all group">
                    <i className="fa-solid fa-biohazard text-2xl text-red-400 mb-3 group-hover:scale-125 transition-transform"></i>
                    <h4 className="font-bold text-gray-200">Forensic Cleanup</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Detect and repair data anomalies</p>
                </button>
            </div>
          </div>

          {/* Right Column: Feeds & Info */}
          <div className="flex flex-col gap-6">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                   <span className="text-[9px] orbitron font-bold text-gray-400 uppercase tracking-widest">Global Intelligence</span>
                   <span className="w-2 h-2 bg-[#00f3ff] rounded-full animate-ping"></span>
                </div>
                
                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                   {[1, 2, 3].map((_, i) => (
                       <div key={i} className="border-l-2 border-white/10 pl-4 py-1">
                           <p className="text-[10px] text-gray-500 mb-1 font-mono">14:0{i} Zulu Time</p>
                           <p className="text-xs text-gray-300 leading-relaxed">
                               Detected new transformer architecture paper "DeepSeek-V3" trending in sector 7. Recommendation: Update knowledge base.
                           </p>
                       </div>
                   ))}
                </div>
             </div>

             {/* About Project / Architecture Card for Recruiters */}
             <div className="bg-gradient-to-br from-indigo-950/40 to-black border border-indigo-500/20 rounded-2xl p-6">
                 <h4 className="text-indigo-400 font-bold text-xs uppercase mb-2"><i className="fa-solid fa-bolt mr-2"></i>One Key. Infinite Power.</h4>
                 <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                     This entire dashboard is powered by a single Gemini API connection. It dynamically switches between <strong>Pro</strong> (Reasoning), <strong>Flash</strong> (Speed), and <strong>Vision</strong> based on your task.
                 </p>
                 <div className="flex gap-2">
                     <span className="px-2 py-1 bg-black rounded border border-white/10 text-[8px] text-gray-500 uppercase">React 19</span>
                     <span className="px-2 py-1 bg-black rounded border border-white/10 text-[8px] text-gray-500 uppercase">TypeScript</span>
                     <span className="px-2 py-1 bg-black rounded border border-white/10 text-[8px] text-gray-500 uppercase">Gemini 2.5</span>
                 </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
