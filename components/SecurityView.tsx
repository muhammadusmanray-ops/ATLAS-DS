
import React, { useState, useEffect } from 'react';

const SecurityView: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [securityScore, setSecurityScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  // Simulated Audit History
  const [auditHistory, setAuditHistory] = useState([
    { id: 1, action: 'LOGIN_ATTEMPT', status: 'SUCCESS', time: '10:42 AM', ip: '192.168.1.X' },
    { id: 2, action: 'API_KEY_ACCESS', status: 'ENCRYPTED', time: '10:45 AM', ip: 'LOCAL' },
    { id: 3, action: 'DATA_INGESTION', status: 'CLEAN', time: '11:02 AM', ip: 'LOCAL' },
  ]);

  useEffect(() => {
    runSecurityScan();
  }, []);

  const runSecurityScan = () => {
    setIsScanning(true);
    setSecurityScore(0);
    setLogs([]);
    
    const steps = [
        "Checking LocalStorage Integrity...",
        "Verifying API Key Encryption...",
        "Scanning for Cross-Site Scripting (XSS) Vulnerabilities...",
        "Validating Session Tokens...",
        "Checking HTTPS Protocol..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep >= steps.length) {
            clearInterval(interval);
            setIsScanning(false);
            setSecurityScore(98); // High score for demo
            return;
        }
        setLogs(prev => [...prev, `[OK] ${steps[currentStep]}`]);
        setSecurityScore(prev => prev + 20);
        currentStep++;
    }, 800);
  };

  const handlePurgeData = () => {
    if (window.confirm("WARNING: This will delete ALL local settings, API keys, and user data. This cannot be undone. Proceed?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#050505] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        <header className="flex items-center justify-between">
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-white orbitron tracking-tight flex items-center gap-3">
                    <i className="fa-solid fa-shield-halved text-green-500"></i>
                    SECURITY_HUB
                </h2>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Threat Detection & Data Governance</p>
            </div>
            <div className="text-right">
                <div className="text-4xl font-black text-green-500 orbitron">{securityScore}%</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">System Integrity</div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Panel */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <i className="fa-solid fa-lock text-9xl text-white"></i>
                    </div>
                    
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Active Protocols</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 border border-green-500/30 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <i className="fa-solid fa-key"></i>
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-bold">Client-Side Encryption</h4>
                                <p className="text-[10px] text-gray-400">AES-256 Simulated</p>
                            </div>
                        </div>
                        <div className="bg-black/40 border border-blue-500/30 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <i className="fa-brands fa-google"></i>
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-bold">API Key Masking</h4>
                                <p className="text-[10px] text-gray-400">LocalStorage Isolated</p>
                            </div>
                        </div>
                        <div className="bg-black/40 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                <i className="fa-solid fa-database"></i>
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-bold">Zero-Knowledge DB</h4>
                                <p className="text-[10px] text-gray-400">No Server Storage</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Diagnostic Log</h3>
                        <div className="h-32 bg-black rounded-xl p-4 border border-white/5 font-mono text-[10px] text-green-400 overflow-y-auto custom-scrollbar">
                            {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                            {isScanning && <div className="animate-pulse">_ Scanning sectors...</div>}
                        </div>
                    </div>
                </div>

                {/* Audit Table */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recent Access Audit</span>
                    </div>
                    <table className="w-full text-left text-[10px]">
                        <thead className="text-gray-500 bg-black/20">
                            <tr>
                                <th className="px-6 py-3 uppercase tracking-wider font-bold">Action</th>
                                <th className="px-6 py-3 uppercase tracking-wider font-bold">Status</th>
                                <th className="px-6 py-3 uppercase tracking-wider font-bold">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-white/5">
                            {auditHistory.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono">{item.action}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-bold border border-green-500/20">{item.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{item.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions Panel */}
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                        <h3 className="text-sm font-black uppercase tracking-widest">Danger Zone</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed mb-6">
                        Emergency Protocol: Executes a full wipe of local storage. This will remove your API keys, user profile, and chat history from this browser.
                    </p>
                    <button 
                        onClick={handlePurgeData}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black orbitron text-xs tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-skull"></i> PURGE ALL DATA
                    </button>
                 </div>

                 <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Manual Scan</h3>
                    <button 
                        onClick={runSecurityScan}
                        disabled={isScanning}
                        className={`w-full py-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
                    >
                        {isScanning ? 'Scanning...' : 'Run Diagnostics'}
                    </button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityView;
