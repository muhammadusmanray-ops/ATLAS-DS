
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const IntelScan: React.FC = () => {
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
    <div className="h-full flex flex-col p-8 bg-[#020203] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <header className="flex items-center gap-6 border-b border-white/5 pb-8">
          <div className="w-16 h-16 rounded-[2rem] bg-[#00f3ff]/10 border border-[#00f3ff]/30 flex items-center justify-center text-[#00f3ff] shadow-[0_0_30px_rgba(0,243,255,0.15)]">
            <i className="fa-solid fa-crosshairs text-3xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black orbitron italic text-white tracking-widest uppercase">Intel Scan</h2>
            <p className="text-[10px] text-gray-500 orbitron tracking-[0.4em] uppercase mt-1">Multispectral Visual Intelligence Core</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Image Dropzone */}
            <div className={`relative group aspect-[4/3] rounded-[40px] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden bg-white/5 ${image ? 'border-[#00f3ff]/50' : 'border-white/10 hover:border-[#00f3ff]/30 hover:bg-white/[0.07]'}`}>
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-contain p-8 z-10" alt="Target analysis" />

                  {/* HUD Overlays */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f3ff] shadow-[0_0_20px_#00f3ff] animate-[scan_4s_linear_infinite] opacity-50"></div>

                    {/* Corner Accents */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#00f3ff]/40"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#00f3ff]/40"></div>
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[#00f3ff]/40"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#00f3ff]/40"></div>
                  </div>

                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-black border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-30"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-6 p-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-[#00f3ff]/5 border border-[#00f3ff]/20 flex items-center justify-center text-[#00f3ff] group-hover:scale-110 transition-transform duration-500">
                    <i className="fa-solid fa-images text-4xl"></i>
                  </div>
                  <div className="space-y-2">
                    <span className="block orbitron font-black text-xs tracking-widest text-white uppercase">Initialize Image Scan</span>
                    <span className="block text-[8px] text-gray-500 font-mono uppercase tracking-[0.2em]">Upload Multispectral Intel Feed</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Analysis Focus */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] px-2 block italic">Strategic Objectives</label>
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 'Extract text from the receipt' or 'Audit this chart'..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-[#00f3ff] transition-all placeholder:text-gray-700"
                />
                <i className="fa-solid fa-wand-magic-sparkles absolute right-6 top-1/2 -translate-y-1/2 text-gray-600"></i>
              </div>

              <button
                onClick={runAnalysis}
                disabled={!image || isAnalyzing}
                className={`w-full py-5 rounded-[2rem] orbitron font-black text-xs tracking-[0.4em] flex items-center justify-center gap-4 transition-all ${!image || isAnalyzing
                    ? 'bg-white/5 text-gray-600'
                    : 'bg-[#00f3ff] text-black hover:scale-[1.02] shadow-[0_0_40px_rgba(0,243,255,0.3)]'
                  }`}
              >
                {isAnalyzing ? <i className="fa-solid fa-eye fa-bounce"></i> : <i className="fa-solid fa-radar text-lg"></i>}
                {isAnalyzing ? 'PROCESSING VISUALS...' : 'RUN ANALYTIC SCAN'}
              </button>
            </div>
          </div>

          {/* Output Side */}
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 flex flex-col shadow-2xl relative overflow-hidden h-[fit-content] min-h-[500px]">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
              <i className="fa-solid fa-microscope text-[200px] text-white"></i>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                <i className="fa-solid fa-file-invoice"></i>
              </div>
              <div>
                <h3 className="text-white font-black orbitron text-xs tracking-widest uppercase">Intelligence Report</h3>
                <p className="text-[8px] text-gray-600 orbitron">Sector V-88 Output Feed</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {analysis ? (
                <div className="text-gray-300 text-xs leading-[2] font-mono whitespace-pre-wrap animate-in fade-in duration-700">
                  {analysis}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20 py-20">
                  <div className="w-20 h-20 rounded-[2rem] border-2 border-dashed border-gray-500 flex items-center justify-center">
                    <i className="fa-solid fa-image text-3xl text-gray-500"></i>
                  </div>
                  <p className="orbitron text-[8px] font-bold text-gray-500 uppercase tracking-[0.5em]">Awaiting Visual Input</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelScan;
