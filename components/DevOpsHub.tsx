
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const DevOpsHub: React.FC = () => {
  const [stack, setStack] = useState('');
  const [config, setConfig] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuild = async () => {
    if (!stack.trim()) return;
    setIsBuilding(true);
    try {
      const prompt = `Act as a Senior DevOps and Data Engineer. Generate a full production-ready deployment scaffold for this stack: "${stack}". 
      Include:
      1. A robust Dockerfile (multi-stage if applicable)
      2. docker-compose.yml with monitoring (Prometheus/Grafana)
      3. GitHub Actions CI/CD workflow (.yml)
      4. Kubernetes Deployment manifest snippet.
      Focus on scalability and security. Return code blocks with explanations.`;
      
      const response = await geminiService.chat(prompt);
      setConfig(response.text || 'Scaffolding failed.');
    } catch (e) {
      console.error(e);
      setConfig('An error occurred during build.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        <header className="space-y-4 border-l-4 border-indigo-500 pl-6">
          <h2 className="text-4xl font-black tracking-tight">DevOps & Production Hub</h2>
          <p className="text-gray-400 font-mono text-sm tracking-tighter uppercase">Scaffold your entire deployment infrastructure in seconds.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Stack Definition</label>
                <textarea
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  placeholder="e.g. 'PyTorch + FastAPI + Redis + Postgres'"
                  className="w-full h-32 p-4 rounded-xl bg-gray-950 border border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-xs font-mono text-indigo-300"
                />
              </div>

              <div className="p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/30">
                <p className="text-[10px] text-indigo-300 font-bold uppercase mb-2"><i className="fa-solid fa-shield-halved mr-2"></i> Security Presets</p>
                <p className="text-[10px] text-indigo-400 leading-relaxed">Agent will auto-include non-root user setups and secrets management best practices.</p>
              </div>

              <button
                onClick={handleBuild}
                disabled={isBuilding || !stack.trim()}
                className={`w-full py-4 rounded-xl font-black text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${
                  isBuilding ? 'bg-gray-700 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50'
                }`}
              >
                {isBuilding ? <i className="fa-solid fa-terminal animate-pulse"></i> : <i className="fa-solid fa-cubes"></i>}
                {isBuilding ? 'BUILDING...' : 'SCAFFOLD DEPLOYMENT'}
              </button>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-gray-950 h-full min-h-[500px] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-[10px] font-mono text-gray-500 tracking-widest uppercase italic">Infrastructure-as-Code Terminal</span>
                </div>
                {config && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(config)}
                    className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg transition-all"
                  >
                    <i className="fa-solid fa-copy"></i> Copy Repo
                  </button>
                )}
              </div>
              <div className="flex-1 p-8 font-mono text-xs overflow-auto custom-scrollbar text-gray-300">
                {config ? (
                  <pre className="leading-relaxed whitespace-pre-wrap">{config}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10 space-y-6">
                    <i className="fa-solid fa-server text-9xl"></i>
                    <p className="font-mono text-sm tracking-[0.3em] uppercase">Connect stack for build manifest</p>
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

export default DevOpsHub;
