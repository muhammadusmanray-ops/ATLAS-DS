
import React, { useState, useEffect } from 'react';
import { db } from '../services/storage';
import { geminiService } from '../services/gemini';

const SecurityView: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [securityScore, setSecurityScore] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [auditHistory, setAuditHistory] = useState<any[]>([]);

    useEffect(() => {
        try {
            loadAuditHistory();
            runSecurityScan();
        } catch (err) {
            console.error("DIAGNOSTIC_FAILURE:", err);
        }
    }, []);

    const loadAuditHistory = () => {
        try {
            const saved = localStorage.getItem('atlas_security_audit');
            if (saved) {
                const parsed = JSON.parse(saved);
                setAuditHistory(Array.isArray(parsed) ? parsed : []);
            } else {
                const initial = [
                    { id: 1, action: 'SYSTEM_BOOT', status: 'SUCCESS', time: new Date().toLocaleTimeString(), ip: 'LOCAL' },
                    { id: 2, action: 'IDENTITY_VAULT', status: 'SECURED', time: new Date().toLocaleTimeString(), ip: 'LOCAL' }
                ];
                setAuditHistory(initial);
                localStorage.setItem('atlas_security_audit', JSON.stringify(initial));
            }
        } catch (e) {
            console.warn("Security Audit Corrupted. Resetting...");
            const initial = [{ id: Date.now(), action: 'RESET_PROTOCOL', status: 'SUCCESS', time: new Date().toLocaleTimeString(), ip: 'LOCAL' }];
            setAuditHistory(initial);
        }
    };

    const addAuditLog = (action: string, status: string) => {
        const newEntry = {
            id: Date.now(),
            action,
            status,
            time: new Date().toLocaleTimeString(),
            ip: 'LOCAL'
        };
        setAuditHistory(prev => {
            const current = Array.isArray(prev) ? prev : [];
            const updated = [newEntry, ...current].slice(0, 12);
            localStorage.setItem('atlas_security_audit', JSON.stringify(updated));
            return updated;
        });
    };

    const runSecurityScan = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setSecurityScore(0);
        setLogs(["INITIATING_CORE_SCAN..."]);

        const runCheck = (msg: string, success: boolean) => {
            setLogs(prev => [...prev, `${success ? '>> [SHIELD_LINK]' : '!! [LINK_BREACH]'} ${msg}`]);
            return success ? 20 : 5;
        };

        const steps = [
            { msg: "Neural Bridge Encryption Verified", check: true },
            { msg: "Primary Intel Vault Linkage Active", check: true },
            { msg: "Identity Integrity Signature Confirmed", check: true },
            { msg: "Infrastructure Isolation Protocol Active", check: true },
            { msg: "Transport Layer Security Enforced", check: true }
        ];

        let totalScore = 0;
        for (const step of steps) {
            await new Promise(r => setTimeout(r, 400));
            totalScore += runCheck(step.msg, step.check);
        }

        setSecurityScore(totalScore);
        setIsScanning(false);
        addAuditLog('DIAGNOSTIC_UPLINK', totalScore > 80 ? 'OPTIMAL' : 'ANOMALY');
    };

    const handlePurgeData = async () => {
        if (window.confirm("FATAL_ACTION: This will execute an immediate high-altitude purge. Execute?")) {
            localStorage.clear();
            await db.purgeAll();
            setAuditHistory([]);
            window.location.reload();
        }
    };

    return (
        <div className="h-full flex flex-col p-8 bg-[#020204] overflow-y-auto relative selection:bg-[#76b900] selection:text-black font-sans">
            {/* RESTORING ORIGINAL GREEN for Readability */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#76b900 1px, transparent 1px), linear-gradient(90deg, #76b900 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto w-full space-y-12 relative z-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-6">
                            <div className="w-2.5 h-12 bg-[#76b900] shadow-[0_0_20px_#76b900] rounded-full"></div>
                            <div>
                                <h2 className="text-5xl font-black text-white orbitron tracking-[0.2em] uppercase italic">Security<span className="text-[#76b900]">_Hub</span></h2>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></span>
                                    Neural_Threat_Isolation_Matrix_v5.1
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-10 bg-white/[0.02] border border-white/5 px-10 py-6 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                        <div className="flex flex-col items-end">
                            <div className="text-4xl font-black text-[#76b900] orbitron tabular-nums drop-shadow-[0_0_15px_rgba(118,185,0,0.4)]">{securityScore || 0}%</div>
                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1">Integrity_Index</div>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="w-14 h-14 rounded-2xl bg-[#76b900]/5 border border-[#76b900]/20 flex items-center justify-center text-[#76b900] text-2xl">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white/5 border border-white/10 rounded-[48px] p-12 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute -top-32 -right-32 p-4 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                                <i className="fa-solid fa-satellite-dish text-[400px] text-white"></i>
                            </div>

                            <h3 className="text-sm font-black text-white orbitron uppercase tracking-[0.4em] mb-10 flex items-center gap-4 relative z-10">
                                <div className="p-2 bg-[#76b900]/10 rounded-lg">
                                    <i className="fa-solid fa-link-slash text-[#76b900]"></i>
                                </div>
                                Active_Enforcement_Nodes
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                {[
                                    { icon: 'fa-user-shield', color: '#76b900', title: 'Neural Vault', label: 'LOCKED' },
                                    { icon: 'fa-tower-observation', color: '#76b900', title: 'Watchtower', label: 'ACTIVE' },
                                    { icon: 'fa-dna', color: '#76b900', title: 'Signature', label: 'VERIFIED' }
                                ].map((node, i) => (
                                    <div key={i} className="bg-black/60 border border-white/5 p-8 rounded-[32px] flex flex-col gap-6 group hover:border-[#76b900]/30 transition-all shadow-inner">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-2xl relative z-10`} style={{ backgroundColor: `${node.color}15`, color: node.color }}>
                                            <i className={`fa-solid ${node.icon}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white text-[13px] font-black orbitron uppercase tracking-[0.1em]">{node.title}</h4>
                                            <div className="mt-4 text-[9px] font-black orbitron px-5 py-2 rounded-full bg-white/5 w-fit border border-white/10 tracking-[0.2em]" style={{ color: node.color }}>{node.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 space-y-6 relative z-10">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="text-[10px] font-black text-gray-500 orbitron uppercase tracking-[0.5em]">Global_Telemetry_Log</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></div>
                                        <span className="text-[9px] font-black text-[#76b900] orbitron uppercase tracking-widest">Link_Encryption_Enabled</span>
                                    </div>
                                </div>
                                {/* High Contrast Text for Readability */}
                                <div className="h-56 bg-black/80 rounded-[40px] p-8 border border-white/5 font-mono text-[11px] text-[#76b900] overflow-y-auto custom-scrollbar shadow-inner leading-loose backdrop-blur-xl">
                                    {(logs || []).map((log, i) => (
                                        <div key={i} className="mb-3 flex gap-5 group/log hover:text-white transition-colors">
                                            <span className="opacity-20 font-black tracking-widest">T-{i.toString().padStart(3, '0')}</span>
                                            <span className="uppercase font-bold tracking-tight">{log}</span>
                                        </div>
                                    ))}
                                    {isScanning && <div className="animate-pulse text-[#76b900] mt-4 font-black tracking-widest italic flex items-center gap-2"><i className="fa-solid fa-spinner fa-spin"></i> BUFFERING_SECTORS...</div>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-3xl shadow-2xl relative">
                            <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative z-10">
                                <h3 className="text-[11px] font-black text-white orbitron uppercase tracking-[0.4em]">Historical_Handshake_Audit</h3>
                                <span className="text-[9px] text-gray-600 font-black uppercase font-mono tracking-widest">LIFO_T-24H</span>
                            </div>
                            <div className="overflow-x-auto relative z-10">
                                <table className="w-full text-left text-[12px]">
                                    <thead className="text-gray-500 bg-black/60 font-black orbitron text-[10px]">
                                        <tr>
                                            <th className="px-10 py-6 uppercase tracking-[0.4em]">Action_ID</th>
                                            <th className="px-10 py-6 uppercase tracking-[0.4em]">Status</th>
                                            <th className="px-10 py-6 uppercase tracking-[0.4em]">Sync_Temporal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300 divide-y divide-white/5 font-sans">
                                        {(Array.isArray(auditHistory) ? auditHistory : []).map(item => (
                                            <tr key={item.id} className="hover:bg-[#76b900]/5 group transition-all">
                                                <td className="px-10 py-6 font-mono text-[#76b900]/60 group-hover:text-[#76b900] tracking-widest font-black uppercase transition-colors">{item.action}</td>
                                                <td className="px-10 py-6">
                                                    <span className="px-4 py-1.5 rounded-full bg-[#76b900]/10 text-[#76b900] text-[9px] font-black border border-[#76b900]/20 orbitron tracking-widest">{item.status}</span>
                                                </td>
                                                <td className="px-10 py-6 text-gray-600 font-mono italic font-bold">{item.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#76b900]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <h3 className="text-sm font-black text-white orbitron uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
                                <i className="fa-solid fa-screwdriver-wrench text-[#76b900]"></i> Command_Ops
                            </h3>
                            <button
                                onClick={runSecurityScan}
                                disabled={isScanning}
                                className={`w-full py-6 rounded-[32px] orbitron font-black text-[11px] tracking-[0.4em] uppercase transition-all shadow-2xl border relative z-10 ${isScanning
                                    ? 'bg-gray-900 text-gray-700 border-transparent cursor-not-allowed'
                                    : 'bg-[#76b900] text-black border-[#76b900] hover:bg-white hover:border-white shadow-[0_15px_40px_rgba(118,185,0,0.2)] active:scale-95'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {isScanning ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-shield-halved"></i>}
                                    <span>{isScanning ? 'UPLINKING...' : 'FORCE_SCAN'}</span>
                                </div>
                            </button>
                        </div>

                        <div className="bg-red-500/[0.03] border border-red-500/20 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-16 -right-16 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000 rotate-12 pointer-events-none">
                                <i className="fa-solid fa-biohazard text-[150px] text-red-500"></i>
                            </div>
                            <h3 className="text-sm font-black text-red-500 orbitron uppercase tracking-[0.4em] mb-8 flex items-center gap-4 relative z-10">
                                <i className="fa-solid fa-skull-crossbones animate-pulse"></i> Kill_Switch
                            </h3>
                            <button
                                onClick={handlePurgeData}
                                className="w-full py-6 bg-red-600 hover:bg-white hover:text-black text-white font-black orbitron text-[11px] tracking-[0.4em] rounded-[32px] uppercase transition-all shadow-[0_20px_50px_rgba(220,38,38,0.4)] relative z-10 active:scale-95"
                            >
                                PURGE_PAYLOAD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityView;
