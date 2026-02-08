
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const VisionView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const strategicPrompt = prompt 
        ? `Task: ${prompt}. Persona: ATLAS-X (Data Combat Intelligence). Provide a tactical analysis of this visual data.`
        : "Perform a tactical visual inspection. Identify key data points, anomalies, or strategic insights visible in this image. Output format: Briefing Report.";
        
      const res = await geminiService.analyzeImage(image, strategicPrompt);
      setAnalysis(res || "No insights found in visual sector.");
    } catch (e) {
      console.error(e);
      setAnalysis("CRITICAL ERROR: Visual processing node failed. Image may be too complex or corrupted.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <header className="text-center space-y-2">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Visual Data Insights</h2>
            <p className="text-gray-500 text-lg">Upload charts, diagrams, or physical logs for Gemini 3 Pro (Vision) analysis.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className={`relative group aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
                    image ? 'border-indigo-400 bg-white' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-300'
                }`}>
                    {image ? (
                        <>
                            <img src={image} className="w-full h-full object-contain p-4" alt="Target analysis" />
                            <button 
                                onClick={() => setImage(null)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-4 text-gray-400 p-12">
                            <i className="fa-solid fa-cloud-arrow-up text-6xl mb-2"></i>
                            <span className="font-bold uppercase text-xs tracking-widest">Upload Plot / Schematic</span>
                            <span className="text-xs text-gray-400">(PNG, JPEG supported)</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Specific Analysis Focus (Optional)</label>
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. 'Extract the numbers from the bar chart'"
                        className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button
                        onClick={runAnalysis}
                        disabled={!image || isAnalyzing}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                            !image || isAnalyzing ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-700'
                        }`}
                    >
                        {isAnalyzing ? <i className="fa-solid fa-eye fa-bounce"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
                        {isAnalyzing ? 'SCANNING VISUALS...' : 'ANALYZE VISUALS'}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl border border-gray-200 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
                        <i className="fa-solid fa-microscope"></i>
                    </div>
                    <span className="font-bold text-gray-800 uppercase tracking-tighter">Vision Output</span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {analysis ? (
                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium animate-in fade-in duration-500">
                            {analysis}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <i className="fa-solid fa-image text-6xl text-gray-300"></i>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Awaiting Visual Input</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VisionView;
