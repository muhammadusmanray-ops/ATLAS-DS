
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const KaggleHub: React.FC = () => {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<string | null>(null);
  
  // Social Warfare State
  const [socialPost, setSocialPost] = useState<string | null>(null);

  const missions = [
    { id: 'titanic', title: 'Titanic Survival', diff: 'Recruit', desc: 'Predict who survived the disaster.' },
    { id: 'house', title: 'House Prices', diff: 'Veteran', desc: 'Predict sales prices using regression.' },
    { id: 'digit', title: 'Digit Recognizer', diff: 'Commander', desc: 'Computer Vision "Hello World" (MNIST).' },
    { id: 'spaceserver', title: 'Spaceship Titanic', diff: 'Recruit', desc: 'Predict which passengers were transported.' },
  ];

  const submissionSteps = [
    { icon: 'fa-copy', title: '1. Acquire Intel', desc: 'Copy the Python code generated below.' },
    { icon: 'fa-terminal', title: '2. Infiltrate Kaggle', desc: 'Open Kaggle.com -> "Code" -> "New Notebook".' },
    { icon: 'fa-paste', title: '3. Deploy Payload', desc: 'Paste the code into the notebook cell.' },
    { icon: 'fa-play', title: '4. Execute', desc: 'Hit "Run". It will generate a "submission.csv" file.' },
    { icon: 'fa-upload', title: '5. Claim Victory', desc: 'Click "Submit Prediction" on the right panel.' },
  ];

  const generateMissionCode = async (missionTitle: string) => {
    setIsLoading(true);
    setSelectedMission(missionTitle);
    setGeneratedCode(null);
    setSocialPost(null); // Reset social post
    try {
      const prompt = `Generate a COMPLETE, COPY-PASTE READY Python script for the Kaggle Competition: "${missionTitle}". 
      Target Audience: Beginner. 
      Steps to include:
      1. Load Data (pandas)
      2. Handle Missing Values (fillna)
      3. Encode Labels (LabelEncoder)
      4. Train a Simple Model (RandomForest or LogisticRegression)
      5. Create Submission File (submission.csv).
      Add comments explaining every step like you are teaching a friend.`;
      
      const response = await geminiService.chat(prompt);
      setGeneratedCode(response.text || "Mission Generation Failed.");
    } catch (e) {
      setGeneratedCode("Error: Communications jammed.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateLinkedInPost = async () => {
    if (!selectedMission) return;
    setIsLoading(true);
    try {
        const prompt = `Write a professional, engaging LinkedIn post for a Software Engineer who just built a Machine Learning model for the "${selectedMission}" challenge. 
        Tone: Professional, Innovative, Enthusiastic.
        Include:
        - Brief mention of the problem solved.
        - Tech stack used (Python, Pandas, Scikit-Learn).
        - 3-5 relevant hashtags (#MachineLearning, #DataScience, #SoftwareEngineering).
        - A call to action for connections to check it out.`;
        const response = await geminiService.chat(prompt);
        setSocialPost(response.text || "Social uplink failed.");
    } catch (e) {
        setSocialPost("Error: Propaganda engine offline.");
    } finally {
        setIsLoading(false);
    }
  };

  const explainTerm = async () => {
      if(!searchTerm) return;
      setIsLoading(true);
      try {
          const res = await geminiService.chat(`Explain the Data Science term "${searchTerm}" in 1 sentence using a real-world analogy (No technical jargon).`);
          setDefinition(res.text || 'Term unknown.');
      } catch (e) {
          setDefinition("Lookup failed.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-[#020203]">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        <header>
            <h2 className="text-4xl font-black text-white orbitron italic tracking-tight">Kaggle<span className="text-[#00f3ff]">_TACTICAL</span></h2>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">No-Code Deployment Center & Strategy Guide</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Missions */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-crosshairs text-[#00f3ff]"></i> Available Missions
                    </h3>
                    <div className="space-y-3">
                        {missions.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => generateMissionCode(m.title)}
                                className={`w-full text-left p-4 rounded-xl border transition-all group ${
                                    selectedMission === m.title 
                                    ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.2)]' 
                                    : 'bg-black/40 border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-gray-200 text-sm">{m.title}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                                        m.diff === 'Recruit' ? 'bg-green-500/20 text-green-400' : 
                                        m.diff === 'Veteran' ? 'bg-yellow-500/20 text-yellow-400' : 
                                        'bg-red-500/20 text-red-400'
                                    }`}>{m.diff}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 line-clamp-1">{m.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Terminology Scanner */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                     <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-book-skull text-[#ff00ff]"></i> Concept Decrypter
                    </h3>
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="e.g. 'Gradient Descent'"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#ff00ff] outline-none"
                        />
                        <button 
                            onClick={explainTerm}
                            className="bg-[#ff00ff]/20 text-[#ff00ff] px-3 rounded-lg border border-[#ff00ff]/30 hover:bg-[#ff00ff] hover:text-black transition-all"
                        >
                            <i className="fa-solid fa-search"></i>
                        </button>
                    </div>
                    {definition && (
                        <div className="p-3 bg-black/40 rounded-lg border-l-2 border-[#ff00ff] text-xs text-gray-300 animate-in fade-in">
                            <span className="font-bold text-[#ff00ff]">Intel:</span> {definition}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Col: Code & Strategy */}
            <div className="lg:col-span-8">
                <div className="h-full min-h-[600px] bg-[#050508] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                        <div className="flex items-center gap-2">
                            <i className="fa-brands fa-python text-yellow-400"></i>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {selectedMission ? `GENERATING: ${selectedMission}` : 'AWAITING MISSION SELECTION'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                             {generatedCode && (
                                <button 
                                    onClick={generateLinkedInPost}
                                    className="bg-blue-600/20 text-blue-400 hover:text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border border-blue-600/30"
                                >
                                    <i className="fa-brands fa-linkedin"></i> Generate Post
                                </button>
                            )}
                            {generatedCode && (
                                <button 
                                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                                    className="text-[#00f3ff] hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                                >
                                    <i className="fa-solid fa-copy"></i> Copy Payload
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-0 overflow-y-auto custom-scrollbar relative bg-[#0d0d10]">
                        {generatedCode ? (
                            <div className="p-6">
                                {/* Social Warfare Panel */}
                                {socialPost && (
                                    <div className="mb-8 bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-blue-400 font-bold uppercase text-xs tracking-widest">
                                                <i className="fa-brands fa-linkedin mr-2"></i>Social Warfare (Copy to LinkedIn)
                                            </h4>
                                            <button onClick={() => navigator.clipboard.writeText(socialPost)} className="text-xs text-gray-400 hover:text-white"><i className="fa-solid fa-copy"></i></button>
                                        </div>
                                        <div className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed p-4 bg-black/50 rounded-xl">
                                            {socialPost}
                                        </div>
                                    </div>
                                )}

                                {/* Submission Guide */}
                                <div className="mb-8 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6">
                                    <h4 className="text-indigo-400 font-bold uppercase text-xs tracking-widest mb-4">
                                        <i className="fa-solid fa-rocket mr-2"></i>Deployment Protocol (How to Submit)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        {submissionSteps.map((step, idx) => (
                                            <div key={idx} className="bg-black/40 p-3 rounded-xl border border-indigo-500/10 flex flex-col items-center text-center">
                                                <i className={`fa-solid ${step.icon} text-indigo-500 mb-2`}></i>
                                                <span className="text-[9px] font-bold text-white uppercase">{step.title}</span>
                                                <span className="text-[8px] text-gray-500 mt-1">{step.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap leading-relaxed p-4 bg-black rounded-xl border border-white/5">
                                    {generatedCode}
                                </pre>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 space-y-6">
                                {isLoading ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin text-8xl text-[#00f3ff]"></i>
                                        <p className="orbitron uppercase tracking-widest text-xs animate-pulse">Consulting AI Core...</p>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-chess-board text-8xl"></i>
                                        <p className="orbitron uppercase tracking-widest text-xs">Select a mission to begin</p>
                                    </>
                                )}
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

export default KaggleHub;
