
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const AutoEDA: React.FC = () => {
  const [dataInput, setDataInput] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!dataInput.trim()) return;

    setIsAnalyzing(true);

    try {
      const prompt = `Perform a high-fidelity Automated EDA. Generate:
      1. Summary Stats
      2. Missing Values Analysis
      3. Distribution Skewness identification
      4. Correlation insights & Feature engineering roadmap.
      DATA:
      ${dataInput}`;
      const response = await geminiService.chat(prompt);
      setReport(response.text || 'Analysis failed.');
    } catch (e) {
      setReport('SUBSYSTEM_ERROR: Could not complete statistical handshake.');
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
    a.download = `EDA_REPORT_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#020203]">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <i className="fa-solid fa-crosshairs text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black orbitron italic text-white">INTEL_SCAN</h2>
            <p className="text-[10px] text-gray-500 orbitron tracking-[0.3em] uppercase">High-Fidelity Statistical EDA</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                <span className="text-[9px] font-black text-[#00f3ff] orbitron tracking-widest uppercase">Raw Intel Feed</span>
              </div>
              <textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Paste CSV data snippet here for analysis..."
                className="w-full h-96 p-6 bg-transparent text-gray-300 font-mono text-xs outline-none resize-none"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !dataInput.trim()}
              className={`w-full py-4 rounded-2xl orbitron font-black text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${isAnalyzing ? 'bg-gray-800 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20'
                }`}
            >
              {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-radar"></i>}
              {isAnalyzing ? 'RECONNAISSANCE IN PROGRESS...' : 'GENERATE EDA REPORT'}
            </button>
          </div>

          <div className="lg:col-span-8 bg-black/40 border border-white/5 rounded-2xl flex flex-col max-h-[600px]">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black text-gray-400 orbitron tracking-widest uppercase">Analysis Output Console</span>
              {report && (
                <button
                  onClick={handleDownload}
                  className="text-[9px] text-[#00f3ff] font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-download mr-2"></i>Download Report
                </button>
              )}
            </div>
            <div className="p-8 font-mono text-[11px] leading-relaxed text-gray-400 overflow-y-auto custom-scrollbar flex-1">
              {report ? (
                <div className="animate-in fade-in duration-1000">
                  <h3 className="text-[#00f3ff] mb-4 orbitron text-xs font-bold uppercase tracking-widest">{" >>> "} Strategic Insights Output</h3>
                  <div className="whitespace-pre-wrap">{report}</div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                  <i className="fa-solid fa-chart-line text-9xl"></i>
                  <p className="orbitron uppercase tracking-widest">Waiting for Signal...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoEDA;
