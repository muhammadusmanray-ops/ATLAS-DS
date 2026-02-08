
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const ModelArchitect: React.FC = () => {
  const [description, setDescription] = useState('');
  const [architecture, setArchitecture] = useState<string | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);

  const handleDesign = async () => {
    if (!description.trim()) return;
    setIsDesigning(true);
    try {
      const prompt = `Act as a Senior ML Architect. Design a full machine learning pipeline for the following goal: "${description}". 
      Include:
      1. Data Ingestion strategy
      2. Feature Engineering steps
      3. Recommended Model Architecture (with layers if NN)
      4. Deployment strategy (FastAPI/Docker)
      Provide the design in a clean markdown format with Mermaid-style diagrams if possible.`;
      
      const response = await geminiService.chat(prompt);
      setArchitecture(response.text || 'Design failed.');
    } catch (e) {
      console.error(e);
      setArchitecture('An error occurred during architecture design.');
    } finally {
      setIsDesigning(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Pipeline Architect</h2>
          <p className="text-gray-500">Describe your business goal, and I'll architect the entire technical end-to-end pipeline.</p>
        </header>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 space-y-6">
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 'Build a real-time fraud detection system for a fintech app that handles 10k transactions per second...'"
                className="w-full h-32 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
            />
            <button
                onClick={handleDesign}
                disabled={isDesigning || !description.trim()}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                    isDesigning ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'
                }`}
            >
                {isDesigning ? <i className="fa-solid fa-compass-drafting animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                {isDesigning ? 'ARCHITECTING...' : 'GENERATE PRODUCTION BLUEPRINT'}
            </button>
        </div>

        {architecture && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <span className="font-bold text-gray-800 uppercase tracking-widest text-xs">Blueprint Generated</span>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 p-6 rounded-2xl overflow-x-auto">
                    {architecture}
                </pre>
            </div>
        )}
      </div>
    </div>
  );
};

export default ModelArchitect;
