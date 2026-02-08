
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

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
      
      const response = await geminiService.chat(prompt);
      setReport(response.text || 'Analysis failed.');
    } catch (e) {
      setReport('CRITICAL_FAILURE: Subsystem error.');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#020203]">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <i className="fa-solid fa-broom text-2xl"></i>
            </div>
            <div>
                <h2 className="text-2xl font-black orbitron italic text-white">DATA_CLEANER</h2>
                <p className="text-[10px] text-gray-500 orbitron tracking-[0.3em] uppercase">Removes Garbage, Fixes Errors, Polishes Data</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-[#00f3ff] orbitron tracking-widest uppercase">Input Raw Data</span>
                <i className="fa-solid fa-file-csv text-gray-500"></i>
              </div>
              <textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Paste your dirty CSV data here..."
                className="w-full h-96 p-6 bg-transparent text-gray-300 font-mono text-xs outline-none resize-none focus:bg-white/5 transition-colors"
              />
            </div>
            <button
              onClick={handleClean}
              disabled={isCleaning || !dataInput.trim()}
              className={`w-full py-6 rounded-2xl orbitron font-black text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${
                isCleaning || !dataInput.trim() 
                  ? 'bg-gray-900 text-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-[1.02] shadow-[0_0_30px_rgba(220,38,38,0.5)]'
              }`}
            >
              {isCleaning ? <i className="fa-solid fa-gear fa-spin text-xl"></i> : <i className="fa-solid fa-sparkles text-xl"></i>}
              {isCleaning ? 'CLEANING IN PROGRESS...' : 'CLEAN THIS DATA NOW (Remove Errors)'}
            </button>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black text-[#00f3ff] orbitron tracking-widest uppercase">Cleaned Python Code</span>
              {report && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(report)}
                    className="text-[9px] text-gray-400 hover:text-white uppercase font-bold transition-colors"
                  >
                      <i className="fa-solid fa-copy mr-1"></i> Copy Code
                  </button>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-gray-400 bg-[#0d0d10]">
              {report ? (
                <div className="whitespace-pre-wrap animate-in fade-in duration-700">
                    {report}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <i className="fa-brands fa-python text-6xl"></i>
                  <p className="text-[10px] orbitron tracking-widest uppercase">Code will appear here...</p>
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
