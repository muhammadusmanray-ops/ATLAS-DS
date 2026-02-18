
import React, { useState } from 'react';
import { llmAdapter } from '../services/llm';

const DataCleaner: React.FC = () => {
  const [dataInput, setDataInput] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleClean = async () => {
    if (!dataInput.trim()) return;
    setIsCleaning(true);
    try {
      const prompt = `Act as an Expert Data Engineer & Python Specialist.
      TASK: Create a Python script to CLEAN the provided dataset.
      
      CRITICAL ACTIONS REQUIRED:
      1. FIX: Fill missing values (Imputation).
      2. REMOVE: Drop duplicate rows.
      3. STANDARDIZE: Fix inconsistent formatting.
      4. OUTPUT: Provide the complete, runnable Python/Pandas code.
      
      DATA SAMPLE:
      ${dataInput}`;

      const response = await llmAdapter.chat(prompt, "You are an Expert Data Engineer specializing in Python Forensics. Provide ONLY runnable code.");
      setReport(response?.text || 'Analysis failed.');
    } catch (e) {
      setReport('CRITICAL_FAILURE: Subsystem error.');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="flex flex-col p-6 md:p-12 bg-[#020203]">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/40 flex items-center justify-center text-green-500 shadow-[0_0_20px_rgba(118,185,0,0.2)]">
            <i className="fa-solid fa-biohazard text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black orbitron italic text-white tracking-widest uppercase">Data Forensics</h2>
            <p className="text-[10px] text-gray-500 orbitron tracking-[0.3em] uppercase">Scrubbing Sector V-01 | Neural Cleaning Active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-green-400 orbitron tracking-widest uppercase">Registry Feed</span>
                <i className="fa-solid fa-file-csv text-gray-500"></i>
              </div>
              <textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Paste your dirty CSV data here for forensic audit..."
                className="w-full h-96 p-6 bg-transparent text-gray-300 font-mono text-xs outline-none resize-none focus:bg-green-500/[0.03] transition-colors"
              />
            </div>
            <button
              onClick={handleClean}
              disabled={isCleaning || !dataInput.trim()}
              className={`w-full py-6 rounded-2xl orbitron font-black text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${isCleaning || !dataInput.trim()
                ? 'bg-gray-900 text-gray-700 cursor-not-allowed'
                : 'bg-green-600 text-black hover:bg-green-500 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(118,185,0,0.5)]'
                }`}
            >
              {isCleaning ? <i className="fa-solid fa-atom fa-spin text-xl"></i> : <i className="fa-solid fa-broom-ball text-xl"></i>}
              {isCleaning ? 'AUDITING DATA STREAM...' : 'CLEAN DATASET (FORENSIC AUDIT)'}
            </button>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black text-green-400 orbitron tracking-widest uppercase">Forensic Clean Script</span>
              {report && (
                <button
                  onClick={() => navigator.clipboard.writeText(report)}
                  className="text-[9px] text-green-500 hover:text-white uppercase font-bold transition-colors"
                >
                  <i className="fa-solid fa-copy mr-1"></i> Copy Code
                </button>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-gray-400 bg-[#060608]">
              {report ? (
                <div className="whitespace-pre-wrap animate-in fade-in duration-700 selection:bg-green-500 selection:text-black">
                  {report}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <i className="fa-brands fa-python text-6xl"></i>
                  <p className="text-[10px] orbitron tracking-widest uppercase">Forensic Result Awaiting Data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCleaner;
