
import React, { useState } from 'react';
import { llmAdapter } from '../services/llm';
import { AppView } from '../types';

interface ModelArchitectProps {
  onNavigateToAutoML?: (blueprintData: { description: string; target: string }) => void;
}

const ModelArchitect: React.FC<ModelArchitectProps> = ({ onNavigateToAutoML }) => {
  const [description, setDescription] = useState('');
  const [architecture, setArchitecture] = useState<string | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [extractedData, setExtractedData] = useState<{ description: string; target: string } | null>(null);

  const handleDesign = async () => {
    if (!description.trim()) return;
    setIsDesigning(true);
    setArchitecture(null);

    const prompt = `ACT AS THE HEAD SYSTEMS ARCHITECT FOR ATLAS-X.
    MISSION: Design an INDUSTRY-GRADE system blueprint for: "${description}".
    CORE: Llama-4 Maverick / Groq Engine
    
    SPECIAL FOCUS (KHAS):
    1. MVP vs ENTERPRISE: First, tell how to build it CHEAP for testing, then how to SCALE for millions of users.
    2. SECURITY PROTOCOLS: Mention data encryption and compliance (GDPR/HIPAA).
    3. COST OPTIMIZATION: Give a realistic budget table.
    
    STRUCTURE:
    - Tactical Objective (Commander Style).
    - Tech Stack (Modern & Reliable tools).
    - The Blueprint (4 Core Phases with technical depth).
    - INFRASTRUCTURE VERDICT (Executive summary on feasibility).
    
    RESPONSE RULES:
    - Address him as "Usman Bhai" or "Commander".
    - Use Roman Urdu/English mix.
    - Be professional, cynical, and highly technical.
    - No fluff. Focus on what a REAL CLIENT would need to start building tomorrow.`;

    const sysPrompt = "You are ATLAS Architecture Core v4. You specialize in high-stakes industrial AI blueprints, cybersecurity, and cost-efficient cloud scaling.";

    try {
      const response = await llmAdapter.chat(prompt, sysPrompt);
      const blueprintText = response?.text || 'Architecture synthesis failed.';
      setArchitecture(blueprintText);

      // Extract ML-relevant data from blueprint
      const extractPrompt = `From this blueprint, extract ONLY:
1. Dataset description (what data is needed)
2. Target variable (what to predict)

Blueprint:
${blueprintText}

Respond in this exact format:
DATASET: [description]
TARGET: [variable name]`;

      const extractResponse = await llmAdapter.chat(extractPrompt, 'You extract structured data from text.');
      const extractText = extractResponse?.text || '';

      const datasetMatch = extractText.match(/DATASET:\s*(.+?)(?=\nTARGET:|$)/s);
      const targetMatch = extractText.match(/TARGET:\s*(.+?)$/s);

      if (datasetMatch && targetMatch) {
        setExtractedData({
          description: datasetMatch[1].trim(),
          target: targetMatch[1].trim()
        });
      }
    } catch (e) {
      setArchitecture('CRITICAL ERROR: Blueprint core isolated.');
    } finally {
      setIsDesigning(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#020203] overflow-y-auto relative text-white">
      {/* Blueprint Grid Background (GREEN) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#76b900 1px, transparent 1px), linear-gradient(90deg, #76b900 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-6xl mx-auto w-full space-y-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#76b900] flex items-center justify-center text-black shadow-[0_0_30px_rgba(118,185,0,0.4)]">
                <i className="fa-solid fa-chess-board text-2xl"></i>
              </div>
              <h2 className="text-5xl font-black text-white orbitron italic tracking-tighter uppercase">War<span className="text-[#76b900]">_Room_v4</span></h2>
            </div>
            <div className="flex items-center gap-4 px-1">
              <span className="text-[10px] orbitron font-black text-gray-500 uppercase tracking-widest">Protocol:</span>
              <span className="text-[10px] orbitron font-black text-[#76b900] uppercase tracking-widest animate-pulse">Llama-4_Maverick_Active</span>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white/5 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col items-center">
              <span className="text-[8px] orbitron font-black text-gray-600 uppercase">Logic_Node</span>
              <span className="text-[10px] orbitron font-black text-white text-center">G_<span className="text-[#76b900]">ENGINE</span></span>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] orbitron font-black text-gray-600 uppercase text-center">Security</span>
              <span className="text-[10px] orbitron font-black text-[#76b900] uppercase text-center">Encrypted</span>
            </div>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden group backdrop-blur-3xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#76b900]/5 blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-[#76b900]/10"></div>

          <div className="space-y-3">
            <label className="text-[10px] orbitron font-black text-[#76b900] uppercase tracking-[0.3em] px-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></div>
              Industry_Blueprint_Generator
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Commander, what industry-grade system do you want to build? (e.g., 'A decentralized health record platform for 500 hospitals...')"
              className="w-full h-40 p-8 rounded-[32px] bg-black/60 border border-white/5 text-white text-sm outline-none focus:border-[#76b900] transition-all resize-none font-medium placeholder:text-gray-800 shadow-inner"
            />
          </div>

          <button
            onClick={handleDesign}
            disabled={isDesigning || !description.trim()}
            className={`w-full py-6 rounded-[32px] font-black orbitron text-xs tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl ${isDesigning ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#76b900] text-black hover:bg-white hover:text-[#76b900] hover:scale-[1.01] active:scale-95 shadow-[0_10px_40px_rgba(118,185,0,0.2)]'
              }`}
          >
            {isDesigning ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-layer-group"></i>}
            {isDesigning ? 'SYNTHESIZING INDUSTRIAL ARCHITECTURE...' : 'GENERATE PROFESSIONAL BLUEPRINT'}
          </button>
        </div>

        {architecture && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* BLUEPRINT TEXT CARD */}
            <div className="lg:col-span-3 bg-white/5 border border-white/5 rounded-[48px] p-12 relative overflow-hidden backdrop-blur-md shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#76b900]/50 to-transparent"></div>

              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#76b900]/20 border border-[#76b900]/30 flex items-center justify-center text-[#76b900] shadow-xl">
                    <i className="fa-solid fa-building-shield"></i>
                  </div>
                  <div>
                    <span className="font-black orbitron text-white uppercase tracking-widest text-sm">Industrial_Blueprint_v4.4</span>
                    <p className="text-[8px] text-gray-500 font-mono uppercase tracking-[0.2em] mt-1">NVIDIA / Groq Architecture Grade</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {extractedData && onNavigateToAutoML && (
                    <button
                      onClick={() => onNavigateToAutoML(extractedData)}
                      className="px-6 py-2 rounded-full bg-[#76b900] text-black text-[9px] orbitron font-black hover:bg-white transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(118,185,0,0.3)]">
                      <i className="fa-solid fa-rocket mr-2"></i>Deploy to AutoML
                    </button>
                  )}
                  <button className="px-6 py-2 rounded-full border border-white/10 text-[9px] orbitron font-black text-gray-400 hover:bg-white hover:text-black transition-all uppercase tracking-widest">
                    <i className="fa-solid fa-file-shield mr-2 text-[#76b900]"></i>Export Specs
                  </button>
                </div>
              </div>

              <div className="text-gray-300 text-[13px] leading-[1.8] whitespace-pre-wrap font-sans bg-black/40 p-10 rounded-[40px] border border-white/5 shadow-inner">
                {architecture}
              </div>
            </div>

            {/* SIDE METRICS */}
            <div className="space-y-8">
              <div className="bg-[#76b900]/5 border border-[#76b900]/20 rounded-[40px] p-8 space-y-6">
                <h4 className="text-[10px] orbitron font-black text-[#76b900] uppercase tracking-widest border-b border-[#76b900]/20 pb-4">Scaling_Matrix</h4>
                {[
                  { label: 'Security Grade', val: 'BANKING', color: 'text-[#76b900]' },
                  { label: 'MVP Velocity', val: 'FAST', color: 'text-white' },
                  { label: 'Compliance', val: 'ISO/GDPR', color: 'text-[#76b900]' }
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">{m.label}</span>
                    <span className={`text-[10px] orbitron font-black ${m.color}`}>{m.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-black border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#76b900] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <i className="fa-solid fa-shield-halved text-4xl text-[#76b900]/40 mb-4 group-hover:scale-110 transition-transform"></i>
                <span className="text-[8px] orbitron font-black text-gray-600 uppercase tracking-[0.5em] mb-2">Protocol_Seal</span>
                <span className="text-[10px] orbitron text-white uppercase font-black">VERIFIED_v4</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelArchitect;
