
import React, { useState } from 'react';
import { llmAdapter } from '../services/llm';

const VisualHUD: React.FC = () => {
  const [dataInput, setDataInput] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<{ label: string; value: string; color: string }[]>([
    { label: 'Neural Complexity', value: '4.8 Petaflops', color: 'text-green-400' },
    { label: 'Signal Noise', value: '0.002%', color: 'text-[#76b900]' },
    { label: 'Compute Node', value: 'NVIDIA H100 (Sim)', color: 'text-green-500' }
  ]);

  const handleAnalyze = async () => {
    if (!dataInput.trim()) return;

    setIsAnalyzing(true);
    setReport(null);

    try {
      const prompt = `COMPUTE_TARGET: HEAVY_DATA_ANALYSIS
            Perform a high-fidelity NVIDIA-grade Automated EDA. 
            Identify:
            1. Advanced Correlation Matrices (Pearson/Spearman).
            2. Skewness and Kurtosis analysis for all features.
            3. Feature Engineering Roadmap (Identify interactions).
            4. Outlier Detection using IQR and Z-Score methodology.
            
            DATASET_FEED:
            ${dataInput}`;

      const response = await llmAdapter.chat(
        prompt,
        "You are the ATLAS-X NVIDIA-Accelerated Data Analyst Core. Provide extremely deep, technical, and mathematical insights. Use terms like 'Stochastic', 'Variance', 'Gradient', and 'Multivariate'."
      );

      setReport(response.text || 'Analysis failed.');

      // Randomly update telemetry
      setStats(prev => prev.map(s => ({
        ...s,
        value: s.label.includes('Complexity') ? `${(Math.random() * 10).toFixed(1)} Petaflops` : s.value
      })));

    } catch (e) {
      setReport('SUBSYSTEM_ERROR: Neural compute link disrupted in sector 7.');
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
    a.download = `V_HUD_REPORT_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col p-6 bg-[#020203]">
      <div className="w-full space-y-8">
        {/* Header with Nvidia vibe */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-green-600/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_30px_rgba(118,185,0,0.2)]">
              <i className="fa-solid fa-eye text-3xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-black orbitron italic text-white tracking-widest uppercase">Visual HUD</h2>
              <p className="text-[10px] text-gray-500 orbitron tracking-[0.4em] uppercase mt-1">NVIDIA-Accelerated Statistical Forensics</p>
            </div>
          </div>

          <div className="flex gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl text-center backdrop-blur-xl">
                <p className="text-[7px] orbitron font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
                <p className={`text-xs font-black orbitron ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Feed Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black/40 border border-green-500/20 rounded-[40px] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <i className="fa-solid fa-microchip text-8xl text-green-500"></i>
              </div>

              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-green-500/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-green-300 orbitron tracking-[0.2em] uppercase">Compute Buffer</span>
              </div>

              <textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Inject raw data matrix (CSV/JSON format)..."
                className="w-full h-[450px] p-8 bg-transparent text-green-100 font-mono text-[11px] outline-none resize-none custom-scrollbar placeholder:text-gray-700"
              />

              <div className="p-6 bg-green-900/10 border-t border-white/5">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !dataInput.trim()}
                  className={`w-full py-5 rounded-2xl orbitron font-black text-xs tracking-[0.3em] flex items-center justify-center gap-4 transition-all ${isAnalyzing
                    ? 'bg-gray-800 text-gray-500 cursor-wait'
                    : 'bg-green-600 text-black font-black hover:bg-green-500 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(118,185,0,0.3)]'
                    }`}
                >
                  {isAnalyzing ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                  {isAnalyzing ? 'SYNTHESIZING MODEL...' : 'INITIATE DEEP SCAN'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Output Console */}
          <div className="lg:col-span-8">
            <div className="bg-black/40 border border-white/5 rounded-[40px] flex flex-col h-full shadow-2xl overflow-hidden min-h-[600px]">
              <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-terminal text-[10px] text-gray-500"></i>
                  <span className="text-[9px] font-black text-gray-400 orbitron tracking-[0.3em] uppercase">Intelligence Matrix Output</span>
                </div>
                {report && (
                  <button
                    onClick={handleDownload}
                    className="text-[10px] text-green-400 font-black orbitron uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-file-export"></i>
                    Export Briefing
                  </button>
                )}
              </div>

              <div className="p-10 font-mono text-[11px] leading-relaxed text-gray-300 overflow-y-auto custom-scrollbar flex-1 relative">
                {report ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 p-4 bg-green-500/10 border-l-4 border-green-500 rounded-r-xl">
                      <p className="text-[9px] orbitron font-bold text-green-400 mb-1">NODE_STATUS: SUCCESS</p>
                      <p className="text-green-200">Multivariate analysis complete. High-fidelity patterns identified in data stream.</p>
                    </div>
                    <div className="whitespace-pre-wrap selection:bg-green-500 selection:text-black">{report}</div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-[0.03] space-y-8 select-none">
                    <i className="fa-solid fa-brain text-[180px]"></i>
                    <p className="orbitron text-3xl font-black uppercase tracking-[1em]">IDLE</p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin mx-auto"></div>
                        <i className="fa-solid fa-microchip absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 text-xl animate-pulse"></i>
                      </div>
                      <p className="orbitron text-[10px] font-black text-white tracking-[1em] uppercase">Computing...</p>
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
