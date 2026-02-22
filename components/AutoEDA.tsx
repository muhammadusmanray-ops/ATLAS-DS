
import React, { useState, useEffect } from 'react';
import { llmAdapter } from '../services/llm';
import { mcpRegistry, MCPTool } from '../services/mcpRegistry';

type Sector = 'GENERAL' | 'MEDICAL' | 'GENOMICS' | 'MARKET';

const VisualHUD: React.FC = () => {
  const [dataInput, setDataInput] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector>('GENERAL');
  const [isLive, setIsLive] = useState(false);
  const [ticker, setTicker] = useState<string[]>([]);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);

  const [stats, setStats] = useState<{ label: string; value: string; color: string }[]>([
    { label: 'Neural Complexity', value: '18.2 Petaflops', color: 'text-white' },
    { label: 'MCP Registry', value: '4 Sockets Active', color: 'text-white' },
    { label: 'Cloud Buffer', value: '99.9% Sync', color: 'text-white' }
  ]);

  useEffect(() => {
    setMcpTools(mcpRegistry.getActiveTools());
  }, []);

  const sectors: { id: Sector; label: string; icon: string; description: string }[] = [
    { id: 'GENERAL', label: 'Tactical EDA', icon: 'fa-microchip', description: 'NVIDIA-grade statistical deep scan.' },
    { id: 'MEDICAL', label: 'Medical Forensics', icon: 'fa-heart-pulse', description: 'Real-time hospital diagnostics & EHR data.' },
    { id: 'GENOMICS', label: 'Genomic Sequencing', icon: 'fa-dna', description: 'DNA mutation analysis & cancer prediction.' },
    { id: 'MARKET', label: 'Market Intel', icon: 'fa-chart-line', description: 'Financial fraud & market flow analysis.' },
  ];

  // Simulated Real-Time Ticker for Market/Medical
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        const updates = {
          MARKET: [`BTC/USD: $${(90000 + Math.random() * 5000).toFixed(0)}`, `VOL: ${(Math.random() * 10).toFixed(2)}M`, `DETECTING_WHALE_FLOW...`],
          MEDICAL: [`BPM: ${Math.floor(70 + Math.random() * 20)}`, `SP02: 98%`, `SCANNING_PATIENT_Z7...`],
          GENOMICS: [`PCR_VAL: 0.002`, `G-PATH: DETECTED`, `SEQUENCING_NODE_9...`],
          GENERAL: [`CPU: ${Math.floor(Math.random() * 100)}%`, `MEM: 12GB`, `IO_WAIT: 0.00ms`]
        };
        setTicker(prev => [updates[selectedSector][Math.floor(Math.random() * 3)], ...prev].slice(0, 5));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLive, selectedSector]);

  const handleAnalyze = async () => {
    if (!dataInput.trim()) return;

    setIsAnalyzing(true);
    setReport(null);

    try {
      const prompt = `MISSION_PROTOCOL: TITANIUM_ELITE_SCAN
            TARGET_SECTOR: ${selectedSector}
            REAL_TIME_GROUNDING: ${isLive ? 'ACTIVE' : 'INACTIVE'}
            
            INSTRUCTION: Perform an elite-level analysis. Use Google-Search patterns if grounding is active.
            Identify critical data science insights or anomalies in the matrix.
            
            DATASET_FEED:
            ${dataInput}`;

      const response = await llmAdapter.chat(
        prompt,
        `You are the ATLAS-X ${selectedSector} Intelligence Sub-Core. You are currently in Titanium-White Elite mode. Grounded in 2026 data science market reality.`
      );

      setReport(response.text || 'Analysis failed.');

      setStats(prev => prev.map(s => ({
        ...s,
        value: s.label.includes('Complexity') ? `${(Math.random() * 20).toFixed(1)} Petaflops` : s.value
      })));

    } catch (e) {
      setReport('SUBSYSTEM_ERROR: Neural link parity failure.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATLAS_X_${selectedSector}_REPORT.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col p-6 bg-[#020203] h-full overflow-hidden">
      <div className="w-full space-y-8 flex-1 flex flex-col min-h-0">

        {/* Header with White vibe */}
        <div className="flex items-center justify-between border-b border-white/10 pb-8 shrink-0">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl bg-white/5 border border-white/20 flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isLive ? 'animate-pulse' : ''}`}>
              <i className="fa-solid fa-satellite-dish text-2xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black orbitron text-white tracking-widest uppercase italic">Visual HUD</h2>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`px-3 py-1 rounded-full border text-[8px] orbitron font-black transition-all ${isLive ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-white/10 text-white border-white/20'}`}
                >
                  {isLive ? 'LIVE_GROUNDING' : 'OFFLINE_MODE'}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 orbitron tracking-[0.4em] uppercase mt-1">Titanium_Protocol_Alpha</p>
            </div>
          </div>

          {/* REAL-TIME TICKER */}
          {isLive && (
            <div className="flex-1 max-w-md mx-8 flex gap-3 overflow-hidden">
              {ticker.map((t, i) => (
                <span key={i} className="text-[7px] font-mono text-white/20 whitespace-nowrap animate-in slide-in-from-right-2">
                  {t} //
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center backdrop-blur-xl">
                <p className="text-[7px] orbitron font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
                <p className={`text-xs font-black orbitron ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTOR SELECTOR */}
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar shrink-0">
          {sectors.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              className={`flex-1 min-w-[220px] p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${selectedSector === s.id
                ? 'bg-white/10 border-white/40 text-white'
                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <i className={`fa-solid ${s.icon} text-xl ${selectedSector === s.id ? 'text-white' : 'text-gray-700'}`}></i>
                <div>
                  <p className="text-[10px] orbitron font-black uppercase tracking-widest">{s.label}</p>
                  <p className="text-[8px] opacity-40 mt-1 line-clamp-1 italic">{s.description}</p>
                </div>
              </div>
              {selectedSector === s.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0 mx-auto w-full max-w-[1700px]">
          {/* LEFT SIDE: DATA & TOOLS */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
            {/* DATA INGESTION CARD */}
            <div className="flex-[2] bg-[#0a0a0b]/60 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col group transition-all hover:border-white/30 min-h-0">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-white'}`}></div>
                  <span className="text-[10px] font-black text-white orbitron tracking-[0.2em] uppercase italic">Matrix_Ingestion</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                </div>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  placeholder="Drop Matrix Data (CSV/DNA/MARKET)..."
                  className="w-full h-full p-8 bg-transparent text-white font-mono text-xs outline-none resize-none custom-scrollbar placeholder:text-white/5 leading-relaxed selection:bg-white selection:text-black"
                />
                {dataInput.length > 0 && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] orbitron font-bold text-white/40 uppercase">
                    Payload: {(dataInput.length / 1024).toFixed(2)} KB
                  </div>
                )}
              </div>

              <div className="p-6 bg-black/40 border-t border-white/10 shrink-0">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !dataInput.trim()}
                  className={`w-full py-5 rounded-2xl orbitron font-black text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 transition-all ${isAnalyzing
                    ? 'bg-gray-900 text-gray-700'
                    : 'bg-white text-black hover:bg-white/90 hover:scale-[1.01] active:scale-95 shadow-[0_0_35px_rgba(255,255,255,0.15)]'
                    }`}
                >
                  {isAnalyzing ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                  {isAnalyzing ? 'SYNCHRONIZING...' : 'START_MISSION'}
                </button>
              </div>
            </div>

            {/* MCP MOUNTED TOOLS LIST (The "Real" Factor) */}
            <div className="flex-1 bg-[#0a0a0b]/40 border border-white/5 rounded-[2.5rem] p-6 space-y-4 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-plug text-[10px] text-white"></i>
                  <span className="text-[9px] orbitron font-black text-gray-400 uppercase tracking-widest">Protocol_Nodes</span>
                </div>
                <span className="text-[8px] orbitron font-bold text-[#76b900] uppercase tracking-widest">MCP_ACTIVE</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                {mcpTools.map(tool => (
                  <div key={tool.id} className="group/tool relative flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${tool.status === 'ACTIVE' ? 'bg-[#76b900] shadow-[0_0_8px_#76b900]' : 'bg-gray-600'}`}></div>
                      <div>
                        <p className="text-[9px] font-black text-white/80 orbitron uppercase tracking-tighter">{tool.name}</p>
                        <p className="text-[7px] text-gray-600 font-mono truncate max-w-[140px]">{tool.endpoint}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] orbitron font-bold text-white/30">{tool.latency}</p>
                      <p className="text-[6px] text-white/10 uppercase font-black tracking-widest">{tool.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col min-h-0">
            <div className="bg-[#050508] border border-white/10 rounded-[2.5rem] flex flex-col h-full shadow-2xl overflow-hidden group/output relative min-h-0">
              <div className="px-8 py-3 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-white/40'}`}></div>
                  <span className="text-[9px] font-black text-white/40 orbitron tracking-[0.4em] uppercase">Intelligence_Briefing_{selectedSector}</span>
                </div>
                {report && (
                  <button onClick={handleDownload} className="text-[8px] orbitron text-white/60 hover:text-white transition-colors border border-white/20 px-4 py-1.5 rounded-lg font-black uppercase tracking-widest bg-white/5">
                    Export_Briefing
                  </button>
                )}
              </div>

              <div className="p-10 font-mono text-[11px] leading-relaxed text-gray-500 overflow-y-auto custom-scrollbar flex-1 relative bg-black/[0.2]">
                {report ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                    {/* TOP STATUS PROTOCOL */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                          <i className="fa-solid fa-shield-halved text-xl"></i>
                        </div>
                        <div>
                          <p className="text-[10px] orbitron font-black text-white uppercase tracking-widest">Mission_Briefing_V11</p>
                          <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest">{isLive ? 'Link: REAL_TIME_MCP_ACTIVE' : 'Link: OFFLINE_SYNTHESIS'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] orbitron font-bold text-gray-500 uppercase tracking-widest">Confidence_Index</p>
                        <p className="text-xl font-black orbitron text-white italic">98.4%</p>
                      </div>
                    </div>

                    {/* DYNAMIC CONTENT WRAPPER */}
                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group/card hover:border-white/20 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/card:opacity-10 transition-opacity">
                          <i className="fa-solid fa-file-waveform text-5xl"></i>
                        </div>
                        <div className="whitespace-pre-wrap selection:bg-white selection:text-black tracking-normal text-white/80 leading-loose">
                          {report}
                        </div>
                      </div>
                    </div>

                    {/* RESOURCE ALLOCATION MANIFEST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[7px] orbitron font-bold text-[#76b900] uppercase tracking-widest mb-3">Infrastructure_Node</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500 font-mono">Container_ID</span>
                            <span className="text-white font-mono">ATX_77_DOCKER</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500 font-mono">Logic_Core</span>
                            <span className="text-white font-mono">NEON_X_v4.2</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500 font-mono">Status</span>
                            <span className="text-[#76b900] font-black uppercase">Ready_to_Deploy</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[7px] orbitron font-bold text-white uppercase tracking-widest mb-3">NVIDIA_Compute_Grid</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500 font-mono">GPU_Mesh</span>
                            <span className="text-white font-mono">8x H100 (Cluster_A)</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500 font-mono">Memory_Alloc</span>
                            <span className="text-white font-mono">640GB VRAM</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500 font-mono">Latency</span>
                            <span className="text-white font-mono">0.02ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CALL TO ACTION NODE */}
                    <div className="flex gap-4 pt-4">
                      <button onClick={handleDownload} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl orbitron text-[9px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center justify-center gap-3">
                        <i className="fa-solid fa-file-export"></i>
                        Export_Telemetry
                      </button>
                      <button className="flex-1 py-4 bg-white text-black rounded-xl orbitron text-[9px] font-black hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <i className="fa-solid fa-microchip"></i>
                        Push_to_MCP_Server
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-[0.02] space-y-4 select-none group-hover/output:opacity-[0.05] transition-opacity duration-1000">
                    <i className="fa-solid fa-microchip text-[120px] text-white"></i>
                    <p className="orbitron text-sm font-black uppercase tracking-[2em] ml-[2em] text-white">CORE_IDENTIFYING_TARGET</p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                      <i className="fa-solid fa-atom fa-spin text-white text-3xl"></i>
                      <span className="orbitron text-[8px] font-black text-white/40 tracking-[0.5em] uppercase animate-pulse">Syncing_with_MCP_Hub...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualHUD;
