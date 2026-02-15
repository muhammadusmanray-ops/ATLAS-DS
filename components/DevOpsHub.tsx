
import React, { useState } from 'react';
import { llmAdapter } from '../services/llm';

const DevOpsHub: React.FC = () => {
  const [stack, setStack] = useState('');
  const [config, setConfig] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [activeFile, setActiveFile] = useState(0);

  // Guide Assistant State
  const [guideMessages, setGuideMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Assalam o Alaikum Usman Bhai! Main aapka Production Hub Guide hoon. Koi bhi sawal puchein - files ka maqsad, industry tips, ya kuch bhi!' }
  ]);
  const [guideInput, setGuideInput] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isGuideSpeaking, setIsGuideSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleBuild = async () => {
    if (!stack.trim()) return;
    setIsBuilding(true);
    setFiles([]);
    try {
      const prompt = `Act as a Senior Infrastructure Architect. 
      MISSION: Generate actual production files for: "${stack}".
      
      CRITICAL: You MUST provide the code inside blocks with a filename header like this:
      --- FILENAME: Dockerfile ---
      (code here)
      --- FILENAME: docker-compose.yml ---
      (code here)
      --- FILENAME: deploy.sh ---
      (code here)

      Include: Dockerfile, docker-compose.yml, and a deployment script. 
      Response tone: Extreme technical precision for Usman Bhai.`;

      const response = await llmAdapter.chat(prompt, "You are a Senior Infrastructure Architect specializing in Production Systems.");
      const text = response.text || '';

      // Parse files from response
      const fileMatches = text.split(/--- FILENAME: (.*?) ---/);
      const extractedFiles = [];
      for (let i = 1; i < fileMatches.length; i += 2) {
        extractedFiles.push({
          name: fileMatches[i].trim(),
          content: fileMatches[i + 1].replace(/```(.*?)\n/g, '').replace(/```/g, '').trim()
        });
      }

      if (extractedFiles.length > 0) {
        setFiles(extractedFiles);
      } else {
        setFiles([{ name: 'README.md', content: text }]);
      }
      setConfig(text);
    } catch (e) {
      console.error(e);
      setConfig('An error occurred during build.');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleGuideChat = async () => {
    if (!guideInput.trim()) return;

    const userMsg = guideInput;
    setGuideMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setGuideInput('');

    try {
      const context = `Current Stack: ${stack || 'None'}
Generated Files: ${files.map(f => f.name).join(', ') || 'None yet'}

User Question: ${userMsg}

Instructions:
- Respond in the SAME language as the question (Roman Urdu/Urdu/English).
- Be helpful and explain technical concepts simply.
- Reference the current stack and files when relevant.
- Keep responses concise (max 3-4 sentences).
- Address user as "Usman Bhai" or "Aap".`;

      const response = await llmAdapter.chat(context, "You are ATLAS Guide, a technical mentor for Usman Bhai.");
      const assistantMsg = response.text || 'Sorry, kuch masla ho gaya.';

      setGuideMessages(prev => [...prev, { role: 'assistant', text: assistantMsg }]);
    } catch (e) {
      console.error(e);
      setGuideMessages(prev => [...prev, { role: 'assistant', text: 'Error: Connection issue. Please try again.' }]);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsGuideSpeaking(true);
      utterance.onend = () => setIsGuideSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setGuideInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const downloadBundle = () => {
    const combined = files.map(f => `### FILE: ${f.name}\n${f.content}\n\n`).join('---\n');
    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas_production_bundle_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-[#020203]">
      <div className="max-w-7xl mx-auto w-full space-y-12 flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-12 bg-[#76b900] rounded-full shadow-[0_0_20px_rgba(118,185,0,0.5)] shrink-0"></div>
              <h2 className="text-3xl md:text-5xl font-black text-white orbitron italic tracking-tight">Base<span className="text-[#76b900]">_OPS</span></h2>
            </div>
            <p className="text-gray-500 font-mono text-[9px] uppercase tracking-[0.4em] px-1">Industry 4.0 Deployment Hub</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center flex-1 md:flex-none">
              <span className="text-[7px] orbitron text-green-400 uppercase font-bold tracking-widest">Environment</span>
              <span className="text-[10px] text-white font-black">DOCKER_SWARM</span>
            </div>
            <button
              onClick={downloadBundle}
              disabled={files.length === 0}
              className="px-8 py-3 bg-green-600 hover:bg-white hover:text-green-600 disabled:opacity-20 text-black orbitron text-[10px] font-black rounded-2xl transition-all shadow-xl shadow-green-600/20 flex-1 md:flex-none whitespace-nowrap"
            >
              <i className="fa-solid fa-download mr-2"></i> Bundle
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
          {/* CONTROL PANEL */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <label className="text-[10px] orbitron font-bold text-[#76b900] uppercase tracking-widest px-1">Infrastructure Blueprint</label>
                  <textarea
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    placeholder="e.g. 'Python API + Redis + Postgres'"
                    className="w-full h-40 p-6 rounded-3xl bg-black/60 border border-white/10 focus:border-[#76b900] outline-none resize-none text-[10px] font-mono text-green-300 transition-all placeholder:text-gray-700"
                  />
                </div>

                <div className="p-5 bg-green-500/10 rounded-3xl border border-green-500/30">
                  <h4 className="text-[9px] orbitron text-green-400 font-black uppercase tracking-widest mb-3">Deployment Protocol (Asli Code):</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <span className="w-4 h-4 rounded bg-green-500/20 text-green-400 text-[8px] flex items-center justify-center font-bold">01</span>
                      <p className="text-[9px] text-gray-500 leading-tight">Apne computer par naya folder banayein.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-4 h-4 rounded bg-green-500/20 text-green-400 text-[8px] flex items-center justify-center font-bold">02</span>
                      <p className="text-[9px] text-gray-500 leading-tight">Bundle download kar ke files copy karein.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-4 h-4 rounded bg-green-500/20 text-green-400 text-[8px] flex items-center justify-center font-bold">03</span>
                      <p className="text-[9px] text-gray-500 leading-tight">Terminal mein <code className="text-white">docker compose up</code> chalayein.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBuild}
                  disabled={isBuilding || !stack.trim()}
                  className={`w-full py-5 rounded-3xl font-black orbitron text-[10px] tracking-[0.2em] flex items-center justify-center gap-4 transition-all ${isBuilding ? 'bg-gray-800 text-gray-600' : 'bg-[#76b900] text-black hover:bg-white shadow-[0_10px_40px_rgba(118,185,0,0.3)] hover:scale-[1.02]'
                    }`}
                >
                  {isBuilding ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                  {isBuilding ? 'CALCULATING MANIFESTS...' : 'GENERATE PRODUCTION FILES'}
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC TERMINAL & FILE TREE */}
          <div className="md:col-span-8 flex flex-col gap-6 order-last md:order-none">
            <div className="flex-1 flex flex-col md:flex-row bg-black/80 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative min-h-[500px]">

              {/* FILE TREE SIDEBAR */}
              <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] flex flex-col p-6 h-48 md:h-auto overflow-y-auto">
                <h4 className="text-[8px] orbitron font-black text-gray-600 uppercase tracking-widest mb-6">Manifest_Tree</h4>
                <div className="flex-1 space-y-2">
                  {files.length > 0 ? (
                    files.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveFile(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-mono transition-all ${activeFile === i ? 'bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/20' : 'text-gray-500 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <i className={`fa-solid ${f.name.includes('.') ? 'fa-file-code' : 'fa-file'}`}></i>
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="opacity-20 space-y-4 mt-8">
                      <div className="h-2 w-full bg-white/10 rounded"></div>
                      <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                      <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[7px] orbitron text-gray-400 font-bold uppercase tracking-widest">OPS_KINETIC</span>
                  </div>
                </div>
              </div>

              {/* CODE PREVIEW AREA */}
              <div className="flex-1 flex flex-col">
                <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#76b900] tracking-widest flex items-center gap-3">
                    <i className="fa-solid fa-code-branch"></i>
                    {files[activeFile]?.name || 'root/mission_blueprint'}
                  </span>
                </div>
                <div className="flex-1 p-10 font-mono text-xs overflow-auto custom-scrollbar text-gray-300 leading-relaxed">
                  {isBuilding ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                      <i className="fa-solid fa-atom fa-spin text-4xl text-green-500"></i>
                      <p className="text-[10px] orbitron tracking-[0.3em] animate-pulse">Sequencing Deploy Layers...</p>
                    </div>
                  ) : files.length > 0 ? (
                    <pre className="whitespace-pre-wrap selection:bg-green-500 selection:text-black">{files[activeFile].content}</pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                      <i className="fa-solid fa-layer-group text-[120px] mb-8"></i>
                      <h3 className="orbitron font-black text-xs tracking-[0.6em] uppercase">No Hub Data</h3>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EMBEDDED GUIDE ASSISTANT */}
            <div className={`bg-black/80 rounded-[40px] border border-[#76b900]/20 shadow-2xl overflow-hidden transition-all ${isGuideOpen ? 'h-96' : 'h-16'}`}>
              <button
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className="w-full px-8 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-[#76b900] flex items-center justify-center">
                    <i className="fa-solid fa-robot text-black text-sm"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-black orbitron text-xs">ATLAS Ops Assistant</h4>
                    <p className="text-gray-500 text-[8px] font-mono">Koi bhi sawal puchein - files, deployment, ya infra tips!</p>
                  </div>
                </div>
                <i className={`fa-solid fa-chevron-${isGuideOpen ? 'down' : 'up'} text-[#76b900]`}></i>
              </button>

              {isGuideOpen && (
                <div className="flex flex-col h-[calc(100%-4rem)]">
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {guideMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-robot text-black text-[10px]"></i>
                          </div>
                        )}
                        <div className={`max-w-[80%] p-4 rounded-2xl relative group ${msg.role === 'user'
                          ? 'bg-[#76b900]/10 border border-[#76b900]/20 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-300'
                          }`}>
                          <p className="text-xs leading-relaxed">{msg.text}</p>
                          {msg.role === 'assistant' && (
                            <button
                              onClick={() => speakMessage(msg.text)}
                              className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              title="Sunein (Play Voice)"
                            >
                              <i className="fa-solid fa-volume-high text-black text-[10px]"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {isGuideSpeaking && (
                      <div className="flex items-center gap-2 text-[#76b900] text-xs">
                        <i className="fa-solid fa-volume-high animate-pulse"></i>
                        <span>Speaking...</span>
                      </div>
                    )}
                    {isListening && (
                      <div className="flex items-center gap-2 text-green-400 text-xs">
                        <i className="fa-solid fa-microphone animate-pulse"></i>
                        <span>Listening... Bol kar puchein!</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t border-white/10 flex gap-3">
                    <button
                      onClick={startVoiceInput}
                      disabled={isListening}
                      className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all ${isListening
                        ? 'bg-green-500 text-white animate-pulse'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#76b900]'
                        }`}
                      title="Mic se baat karein"
                    >
                      <i className={`fa-solid fa-microphone ${isListening ? 'animate-pulse' : ''}`}></i>
                    </button>
                    <input
                      type="text"
                      value={guideInput}
                      onChange={(e) => setGuideInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGuideChat()}
                      placeholder="Type ya mic se bolein... (Roman Urdu/English)"
                      className="flex-1 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#76b900] transition-all placeholder:text-gray-600"
                    />
                    <button
                      onClick={handleGuideChat}
                      className="px-6 py-3 rounded-2xl bg-[#76b900] text-black font-bold text-xs hover:bg-white transition-all"
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevOpsHub;
