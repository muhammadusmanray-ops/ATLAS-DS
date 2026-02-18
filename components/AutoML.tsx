
import React, { useState, useEffect } from 'react';
import { llmAdapter } from '../services/llm';

interface AutoMLProps {
  blueprintData?: { description: string; target: string } | null;
}

const AutoML: React.FC<AutoMLProps> = ({ blueprintData }) => {
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [sepsisRisk, setSepsisRisk] = useState(74);
  const [advisorMessages, setAdvisorMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    { role: 'model', content: "COMMANDER. Virtual Nurse Node 09 is online. I am monitoring the Sepsis Matrix for anomalies. Neural sync at 99%. Ready for clinical briefing." }
  ]);
  const [advisorInput, setAdvisorInput] = useState('');
  const [isAdvisorThinking, setIsAdvisorThinking] = useState(false);

  // Auto-populate from War Room blueprint
  useEffect(() => {
    if (blueprintData) {
      setDescription(blueprintData.description);
      setTarget(blueprintData.target);
      // Show notification
      setAdvisorMessages(prev => [...prev, {
        role: 'model',
        content: `BLUEPRINT RECEIVED from War Room. Dataset context and target variable auto-loaded. Ready for model training, Commander.`
      }]);
      setIsAdvisorOpen(true);
    }
  }, [blueprintData]);

  const askAdvisor = async () => {
    if (!advisorInput.trim()) return;
    const userMsg = advisorInput;
    setAdvisorInput('');
    setAdvisorMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAdvisorThinking(true);

    try {
      const sysPrompt = `ACT AS THE HEAD TACTICAL SCIENTIST FOR ATLAS-X. 
        YOU SPECIALIZE IN: 
        1. AutoML Strategy (XGBoost, CatBoost, etc.)
        2. Medical AI Implementation (Diagnostic nodes, patient risk mapping)
        3. Strategic briefings for Usman Bhai (The Commander).
        
        RULES:
        - Use Roman Urdu/English mix. 
        - DO NOT JUST PROVIDE CODE. Explain the logic, the "WHY", and the impact.
        - Be professional, high-tech, and encouraging.`;

      const res = await llmAdapter.chat(userMsg, sysPrompt);
      setAdvisorMessages(prev => [...prev, { role: 'model', content: res?.text || "Neural link unstable." }]);
    } catch (e) {
      setAdvisorMessages(prev => [...prev, { role: 'model', content: "Signal lost." }]);
    } finally {
      setIsAdvisorThinking(false);
    }
  };

  const handleTrain = async () => {
    if (!description.trim() || !target.trim()) return;
    setIsTraining(true);
    setResult(null);

    const prompt = `ACT AS AN NVIDIA-GRADE AUTOML ARCHITECT.
    
    TASK: Generate a complete Python ML Pipeline.
    DATASET_CONTEXT: ${description}
    TARGET_COLUMN: ${target}
    
    REQUIREMENTS:
    1. Perform Automated Preprocessing (handling missing values, encoding).
    2. Compare 3 models: XGBoost, RandomForest, and CatBoost.
    3. Select best model based on cross-validation.
    4. Provide the COMPLETE code using popular libraries (pandas, scikit-learn, xgboost).
    5. Output ONLY the code and a brief summary.`;

    const sysPrompt = "You are ATLAS AutoML Engine, localized on Llama-4 Maverick. You specialize in rapid model prototyping and hyperparameter tuning.";

    try {
      const res = await llmAdapter.chat(prompt, sysPrompt);
      setResult(res?.text || "Communication with AutoML Node failed.");
    } catch (e) {
      setResult("CRITICAL ERROR: Neural grid collapse during hyperparameter search.");
    } finally {
      setIsTraining(false);
    }
  };

  const downloadNotebook = () => {
    if (!result) return;

    const notebookStructure = {
      "cells": [
        {
          "cell_type": "markdown",
          "metadata": {},
          "source": [
            `# Auto-Generated ML Pipeline by ATLAS-X [Groq Edition]\n`,
            `## Mission: ${description}\n`,
            `## Target: ${target}\n`,
            `This notebook was architected by Llama-4 Maverick.`
          ]
        },
        {
          "cell_type": "code",
          "execution_count": null,
          "metadata": {},
          "outputs": [],
          "source": result.split('\n').map(line => line + '\n')
        }
      ],
      "metadata": {
        "kernelspec": {
          "display_name": "Python 3",
          "language": "python",
          "name": "python3"
        }
      },
      "nbformat": 4,
      "nbformat_minor": 4
    };

    const blob = new Blob([JSON.stringify(notebookStructure, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas_automl_mission_${Date.now()}.ipynb`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-[#020203] relative">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#76b900 1px, transparent 1px), linear-gradient(90deg, #76b900 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
        <header className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#76b900] to-green-900/40 flex items-center justify-center shadow-[0_0_30px_rgba(118,185,0,0.3)] border border-[#76b900]/20">
            <i className="fa-solid fa-microchip text-3xl text-white"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white orbitron italic tracking-tight uppercase">AutoML<span className="text-[#76b900]">_LAB_v2</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] orbitron font-bold text-gray-500 uppercase tracking-widest">Powered by</span>
              <span className="text-[10px] orbitron font-black text-[#76b900] uppercase tracking-widest">Llama-4 Maverick</span>
            </div>
          </div>
          <div className="flex-1"></div>
          <button
            onClick={() => setIsAdvisorOpen(!isAdvisorOpen)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${isAdvisorOpen ? 'bg-[#76b900] border-[#76b900]/50 text-black shadow-[0_0_20px_rgba(118,185,0,0.5)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
          >
            <i className="fa-solid fa-user-nurse text-lg"></i>
            <span className="text-[10px] orbitron font-black uppercase tracking-widest">Deploy Virtual Nurse</span>
          </button>
        </header>

        {/* SEPSIS MONITORING HUD */}
        <div className="bg-gradient-to-r from-red-950/20 to-black border border-red-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none group-hover:bg-red-600/10 transition-all duration-1000"></div>

          <div className="relative shrink-0">
            <div className="w-48 h-48 rounded-full border-[6px] border-white/5 flex items-center justify-center relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-900" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (502 * sepsisRisk) / 100} className="text-red-500 transition-all duration-[2000ms] ease-out drop-shadow-[0_0_10px_#ef4444]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black orbitron text-white leading-none">{sepsisRisk}%</span>
                <span className="text-[8px] orbitron font-bold text-red-500 uppercase tracking-widest mt-1">Sepsis Index</span>
              </div>
            </div>
            {/* Pulse Glow */}
            <div className="absolute inset-0 rounded-full animate-ping border-4 border-red-500/20 pointer-events-none"></div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-500 text-[9px] orbitron font-black uppercase tracking-widest animate-pulse">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>Critical_Zone
              </div>
              <span className="text-xs orbitron font-bold text-gray-500 uppercase">Real-Time Patient Stability Matrix</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Blood Pressure', val: '92/64', status: 'LOW' },
                { label: 'Heart Rate', val: '118 BPM', status: 'HIGH' },
                { label: 'Lactate Level', val: '4.2 mmol/L', status: 'CRITICAL' },
                { label: 'Temp', val: '38.9°C', status: 'FEVER' }
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                  <span className="text-[7px] orbitron text-gray-400 uppercase font-black tracking-widest">{stat.label}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{stat.val}</span>
                    <span className={`text-[6px] font-bold px-1.5 py-0.5 rounded ${stat.status === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-yellow-500/20 text-yellow-500'}`}>{stat.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-400 italic">"Commander, sepsis detected at 74% probability. Recommending immediate fluid resuscitation Node protocol."</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6 backdrop-blur-xl">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#76b900] uppercase tracking-widest">Dataset Context</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your data (e.g., 'Telecom churn data with 20 features...')"
                  className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-gray-300 outline-none focus:border-[#76b900] transition-colors resize-none placeholder:text-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#76b900] uppercase tracking-widest">Target Variable</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. 'Churn' or 'Price'"
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-gray-300 outline-none focus:border-[#76b900] transition-colors placeholder:text-gray-700"
                />
              </div>

              <button
                onClick={handleTrain}
                disabled={isTraining || !description || !target}
                className={`w-full py-4 rounded-xl orbitron font-bold text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${isTraining ? 'bg-gray-800 text-gray-500 shadow-none' : 'bg-[#76b900] text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_20px_rgba(118,185,0,0.4)]'
                  }`}
              >
                {isTraining ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-vial-circle-check"></i>}
                {isTraining ? 'TUNING MODELS...' : 'INITIATE AUTO_TRAIN'}
              </button>
            </div>

            <div className="bg-[#76b900]/5 border border-[#76b900]/10 p-6 rounded-3xl">
              <h4 className="text-[#76b900] font-bold text-[10px] orbitron uppercase mb-4 tracking-tighter"><i className="fa-solid fa-shield-virus mr-2"></i>Groq_Model_Matrix</h4>
              <div className="flex flex-wrap gap-2">
                {['XGBoost', 'CatBoost', 'LightGBM', 'NeuralNet', 'SVM'].map(m => (
                  <span key={m} className="px-3 py-1.5 bg-[#76b900]/10 text-[#76b900] rounded-lg text-[9px] orbitron border border-[#76b900]/20">{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            <div className="h-full min-h-[500px] bg-[#050508] border border-white/5 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl">
              <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-6 justify-between backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#76b900]"></div>
                  <span className="text-[9px] orbitron font-black text-gray-500 uppercase tracking-widest">Training Console Output</span>
                </div>
                {result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        navigator.clipboard.writeText(result);
                        // Show visual feedback
                        const btn = e.currentTarget as HTMLButtonElement;
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>COPIED!';
                        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                      }}
                      className="px-4 py-1 rounded-full bg-[#76b900] text-black text-[9px] orbitron font-bold uppercase hover:bg-white transition-all shadow-[0_0_15px_rgba(118,185,0,0.3)]"
                    >
                      <i className="fa-solid fa-copy mr-2"></i>Copy Code
                    </button>
                    <button
                      onClick={downloadNotebook}
                      className="px-4 py-1 rounded-full bg-[#76b900]/20 text-[#76b900] text-[9px] orbitron font-bold uppercase hover:bg-[#76b900] hover:text-black transition-all border border-[#76b900]/30 shadow-[0_0_10px_rgba(118,185,0,0.2)]"
                    >
                      <i className="fa-solid fa-file-export mr-2"></i>Download Code
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
                {isTraining ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
                    <i className="fa-solid fa-dna text-5xl text-[#76b900]/40"></i>
                    <span className="text-[10px] orbitron text-gray-500 uppercase tracking-widest">Searching Model Space...</span>
                  </div>
                ) : result ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <pre className="bg-[#76b900]/5 border border-[#76b900]/10 p-6 rounded-2xl text-green-300/90 font-mono text-[11px] whitespace-pre-wrap leading-relaxed shadow-inner">{result}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                    <div className="relative">
                      <i className="fa-solid fa-code-merge text-8xl"></i>
                    </div>
                    <p className="orbitron uppercase tracking-widest text-[10px]">Ready for Intelligent Prototyping</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TACTICAL VIRTUAL NURSE (FLOATING OVERLAY) */}
      {isAdvisorOpen && (
        <div className="fixed bottom-10 right-10 w-[420px] h-[600px] bg-[#050508]/90 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl flex flex-col z-50 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#76b900]/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#76b900] flex items-center justify-center text-black shadow-[0_0_20px_rgba(118,185,0,0.4)] relative">
                <i className="fa-solid fa-user-nurse text-xl"></i>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-black animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs orbitron font-black text-white uppercase tracking-widest italic">ATLAS_NURSE_v3</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></span>
                  <span className="text-[8px] orbitron text-gray-500 uppercase font-bold tracking-[0.2em]">Neural_Link: 100% Active</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsAdvisorOpen(false)} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {advisorMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl text-[12px] leading-relaxed relative ${msg.role === 'user' ? 'bg-[#76b900] text-black font-bold' : 'bg-white/5 border border-white/10 text-gray-300 shadow-xl'}`}>
                  <div className={`text-[7px] orbitron font-black mb-2 uppercase opacity-50 ${msg.role === 'user' ? 'text-black' : 'text-indigo-400'}`}>
                    {msg.role === 'user' ? 'Commander_Briefing' : 'Nurse_Intel_Logic'}
                  </div>
                  {msg.content}
                  {msg.role === 'model' && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                      <button className="px-3 py-1 bg-white/5 rounded-lg text-[8px] orbitron hover:bg-white/10 transition-colors">Analyze Vitals</button>
                      <button className="px-3 py-1 bg-white/5 rounded-lg text-[8px] orbitron hover:bg-white/10 transition-colors">Risk Protocol</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isAdvisorThinking && (
              <div className="flex items-center gap-3 p-5 bg-white/5 rounded-3xl border border-white/10 animate-pulse">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-[#76b900] animate-bounce"></div>
                  <div className="w-1 h-3 bg-[#76b900] animate-bounce delay-75"></div>
                  <div className="w-1 h-3 bg-[#76b900] animate-bounce delay-150"></div>
                </div>
                <span className="text-[9px] orbitron uppercase text-[#76b900] tracking-widest font-black">Decrypting Medical Patterns...</span>
              </div>
            )}
          </div>

          <div className="p-6 bg-black/80 border-t border-white/5 backdrop-blur-2xl">
            <div className="flex gap-3">
              <input
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAdvisor()}
                placeholder="Uman Bhai, ask about sepsis or patterns..."
                className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs outline-none focus:border-[#76b900] transition-all placeholder:text-gray-700 font-mono"
              />
              <button
                onClick={askAdvisor}
                className="w-14 h-14 rounded-2xl bg-[#76b900] text-black flex items-center justify-center hover:bg-white transition-all shadow-[0_0_30px_rgba(118,185,0,0.3)] active:scale-90"
              >
                <i className="fa-solid fa-microchip text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoML;
