
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { db } from '../services/storage';
import { llmAdapter } from '../services/llm';

interface SettingsViewProps {
    user: User | null;
    onUpdateUser: (user: User) => void;
    onClearChat: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onClearChat }) => {
    const [saved, setSaved] = useState(false);
    const [groqKeyInput, setGroqKeyInput] = useState('');
    const [geminiKeyInput, setGeminiKeyInput] = useState('');

    const [groqKeys, setGroqKeys] = useState<string[]>([]);
    const [geminiKeys, setGeminiKeys] = useState<string[]>([]);
    const [voiceKeys, setVoiceKeys] = useState<string[]>([]);
    const [quota, setQuota] = useState(llmAdapter.getQuota());
    const [voiceKeyInput, setVoiceKeyInput] = useState('');

    // Profile State
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileRank, setProfileRank] = useState(user?.rank || 'Lead Scientist');
    const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeProvider, setActiveProvider] = useState(llmAdapter.getConfig().provider);
    const [llmUrl, setLlmUrl] = useState(llmAdapter.getConfig().baseUrl || '');
    const [llmModel, setLlmModel] = useState(llmAdapter.getConfig().model || '');

    useEffect(() => {
        setGroqKeys(llmAdapter.getKeys('groq'));
        setGeminiKeys(llmAdapter.getKeys('gemini'));

        llmAdapter.onQuotaUpdate((q) => {
            setQuota(q);
            setGroqKeys(llmAdapter.getKeys('groq'));
            setGeminiKeys(llmAdapter.getKeys('gemini'));
        });

        // Load voice keys from DB
        db.getSettings('voice_keys').then(keys => setVoiceKeys(keys || []));
    }, []);

    const handleUpdateProfile = async () => {
        if (!user) return;
        const updatedUser: User = {
            ...user,
            name: profileName,
            rank: profileRank as 'Commander' | 'Lead Scientist' | 'Junior Intel',
            avatar: profileAvatar
        };

        // DUAL PERSISTENCE: Save to both localStorage AND IndexedDB
        localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(updatedUser));
        await db.saveUser(updatedUser);

        onUpdateUser(updatedUser);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const addKey = async (provider: 'groq' | 'gemini') => {
        const input = provider === 'groq' ? groqKeyInput : geminiKeyInput;
        if (!input) return;
        await llmAdapter.addKey(provider, input);
        if (provider === 'groq') setGroqKeyInput('');
        else setGeminiKeyInput('');
    };

    const removeKey = async (provider: 'groq' | 'gemini', index: number) => {
        await llmAdapter.removeKey(provider, index);
    };

    const addVoiceKey = async () => {
        if (!voiceKeyInput || voiceKeys.length >= 3) return;
        const newKeys = [...voiceKeys, voiceKeyInput];
        setVoiceKeys(newKeys);
        await db.saveSettings('voice_keys', newKeys);
        setVoiceKeyInput('');
    };

    const removeVoiceKey = async (index: number) => {
        const newKeys = voiceKeys.filter((_, i) => i !== index);
        setVoiceKeys(newKeys);
        await db.saveSettings('voice_keys', newKeys);
    };

    const saveCoreSettings = async () => {
        const currentConfig = llmAdapter.getConfig();
        await llmAdapter.saveConfig({
            ...currentConfig,
            provider: activeProvider,
            baseUrl: llmUrl,
            model: llmModel
        });
        alert("Settings Saved Successfully.");
    };

    return (
        <div className="h-full flex flex-col p-8 bg-[#020204] overflow-y-auto selection:bg-[#76b900] selection:text-black font-sans">
            <div className="max-w-6xl mx-auto w-full space-y-12 pb-20">
                <header className="border-b border-white/5 pb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black text-white orbitron tracking-tighter">Config<span className="text-[#76b900]">_Center</span></h2>
                        <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.4em] font-bold">Neural Parameters & Interface Calibration</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] orbitron font-black text-[#76b900] uppercase tracking-widest bg-[#76b900]/5 px-6 py-2 rounded-full border border-[#76b900]/20">
                        <i className="fa-solid fa-satellite animate-pulse"></i> Link: Stable
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Profile Section - ULTRA PRO */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-8 backdrop-blur-3xl shadow-2xl h-fit relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                                <i className="fa-solid fa-shield-cat text-8xl text-white"></i>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                <i className="fa-solid fa-user-ninja text-[#76b900] text-xl"></i>
                                <h3 className="text-sm font-black text-white orbitron uppercase tracking-widest">Commander ID</h3>
                            </div>

                            <div className="flex flex-col items-center gap-6 py-4 relative z-10">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-[40px] p-1 bg-[#76b900]/20 border border-[#76b900]/40 overflow-hidden shadow-[0_0_30px_rgba(118,185,0,0.3)] group-hover:shadow-[0_0_50px_rgba(118,185,0,0.5)] transition-all">
                                        <img src={profileAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usman'} alt="Profile" className="w-full h-full rounded-[35px] object-cover" />
                                    </div>
                                    <div className="absolute inset-0 bg-[#76b900]/60 rounded-[40px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-cloud-arrow-up text-black text-2xl"></i>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-black orbitron text-xl uppercase italic tracking-tighter">{profileName || 'Commander'}</p>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></span>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{profileRank}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] ml-1">Callsign</label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="w-full p-4 bg-black/60 border border-white/5 rounded-2xl text-gray-200 text-sm outline-none focus:border-[#76b900] transition-all font-mono"
                                        placeholder="Enter Callsign..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] ml-1">Tactical Rank</label>
                                    <select
                                        value={profileRank}
                                        onChange={(e) => setProfileRank(e.target.value as 'Commander' | 'Lead Scientist' | 'Junior Intel')}
                                        className="w-full p-4 bg-black/60 border border-white/5 rounded-2xl text-gray-200 text-xs outline-none focus:border-[#76b900] transition-all font-mono appearance-none uppercase"
                                    >
                                        <option value="Junior Intel">Junior Intel</option>
                                        <option value="Lead Scientist">Lead Scientist</option>
                                        <option value="Commander">Commander (Elite)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleUpdateProfile}
                                    className="w-full py-5 bg-[#76b900] text-black font-black orbitron text-[10px] tracking-[0.3em] rounded-2xl transition-all uppercase shadow-[0_15px_30px_rgba(118,185,0,0.2)] hover:bg-white active:scale-95"
                                >
                                    {saved ? 'ID_SYNCHRONIZED' : 'UPDATE_COMMAND_LINK'}
                                </button>
                            </div>
                        </div>

                        {/* Tactical Stats Card */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-3xl shadow-2xl">
                            <h3 className="text-[10px] font-black text-white orbitron uppercase tracking-[0.3em] flex items-center gap-3">
                                <i className="fa-solid fa-chart-line text-[#76b900]"></i> Neural Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-[#76b900]/30 transition-colors">
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Success Rate</p>
                                    <p className="text-[#76b900] orbitron font-black text-lg">98.4%</p>
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-[#76b900]/30 transition-colors">
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Neural Sync</p>
                                    <p className="text-[#76b900] orbitron font-black text-lg">MAX</p>
                                </div>
                            </div>
                        </div>

                        {/* PREMIUM DEVELOPER LICENSE CARD */}
                        <div className="bg-gradient-to-br from-[#76b900]/10 via-black to-indigo-950/20 border border-[#76b900]/20 p-8 rounded-[40px] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#76b900 1px, transparent 1px), linear-gradient(90deg, #76b900 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            </div>

                            {/* Verified Badge */}
                            <div className="absolute top-4 right-4 bg-[#76b900] text-black px-3 py-1 rounded-full text-[7px] font-black orbitron uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                <i className="fa-solid fa-shield-check"></i> Verified
                            </div>

                            <div className="relative z-10 space-y-6">
                                {/* Header with Profile Photo */}
                                <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                                    {/* Profile Photo */}
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                                            <img
                                                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Usman"}
                                                alt="Usman Ray"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border-2 border-black">
                                            <i className="fa-solid fa-star text-black text-[10px]"></i>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-white orbitron uppercase tracking-[0.2em]">Usman Ray</h3>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Elite Data Scientist</p>
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Atlas-X Certified Professional</p>
                                    </div>

                                    {/* GDG Badge */}
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                                        <div className="flex gap-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                                        </div>
                                        <span className="text-[7px] font-black text-white orbitron uppercase">GDG</span>
                                    </div>
                                </div>

                                {/* License Details */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1">Developer ID</p>
                                            <p className="text-white font-mono text-[10px] font-bold">ATX-{user?.id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1">Certification Level</p>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full">
                                                    <p className="text-black text-[8px] font-black orbitron uppercase tracking-wider">Elite Data Scientist</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1">Specialization</p>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="px-2 py-0.5 bg-white/5 border border-white/20 text-gray-300 text-[7px] font-bold rounded uppercase">AI/ML</span>
                                                <span className="px-2 py-0.5 bg-white/5 border border-white/20 text-gray-300 text-[7px] font-bold rounded uppercase">Full-Stack</span>
                                                <span className="px-2 py-0.5 bg-white/5 border border-white/20 text-gray-300 text-[7px] font-bold rounded uppercase">Data Science</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Social Links */}
                                        <div>
                                            <p className="text-[7px] text-gray-600 font-black uppercase tracking-[0.3em] mb-2">Connect</p>
                                            <div className="space-y-2">
                                                <a
                                                    href="https://instagram.com/usmanray25"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[8px] text-gray-400 hover:text-pink-500 transition-colors group/link"
                                                >
                                                    <i className="fa-brands fa-instagram w-4 text-center"></i>
                                                    <span className="font-mono">usmanray25</span>
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/m-usman-ray"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[8px] text-gray-400 hover:text-blue-500 transition-colors group/link"
                                                >
                                                    <i className="fa-brands fa-linkedin w-4 text-center"></i>
                                                    <span className="font-mono">m-usman-ray</span>
                                                </a>
                                                <a
                                                    href="https://wa.me/923363337252"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[8px] text-gray-400 hover:text-green-500 transition-colors group/link"
                                                >
                                                    <i className="fa-brands fa-whatsapp w-4 text-center"></i>
                                                    <span className="font-mono">03363337252</span>
                                                </a>
                                                <a
                                                    href="tel:+923363337252"
                                                    className="flex items-center gap-2 text-[8px] text-gray-400 hover:text-[#76b900] transition-colors group/link"
                                                >
                                                    <i className="fa-solid fa-phone w-4 text-center"></i>
                                                    <span className="font-mono">+92 336 3337252</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-white/5">
                                            <div className="flex justify-between text-[7px]">
                                                <span className="text-gray-500 font-black uppercase">Issued</span>
                                                <span className="text-white font-mono font-bold">Feb 2026</span>
                                            </div>
                                            <div className="flex justify-between text-[7px]">
                                                <span className="text-gray-500 font-black uppercase">Expires</span>
                                                <span className="text-yellow-500 font-mono font-bold">Never</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Signature */}
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Authorized By</p>
                                        <p className="text-white text-[9px] font-bold orbitron mt-0.5">ATLAS-X Neural Command</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Signature</p>
                                        <p className="text-yellow-500 text-lg font-bold italic mt-0.5" style={{ fontFamily: 'cursive' }}>Usman Ray</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Clusters Section */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Core AI Selection */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[48px] space-y-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute -bottom-20 -left-20 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                <i className="fa-solid fa-microchip text-[250px] text-white"></i>
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#76b900]/10 rounded-2xl">
                                        <i className="fa-solid fa-ghost text-[#76b900] text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white orbitron uppercase tracking-widest">Neural Cluster Selection</h3>
                                        <p className="text-xs text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Select Primary Intelligence Relay</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <button
                                    onClick={() => setActiveProvider('openai-compatible')}
                                    className={`p-10 rounded-[40px] border-2 transition-all flex flex-col items-center gap-6 group/btn ${activeProvider === 'openai-compatible'
                                        ? 'bg-[#76b900]/10 border-[#76b900] shadow-[0_20px_60px_rgba(118,185,0,0.2)]'
                                        : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl transition-all ${activeProvider === 'openai-compatible' ? 'bg-[#76b900] text-black shadow-2xl' : 'bg-white/5 text-gray-600'}`}>
                                        <i className="fa-solid fa-bolt-lightning"></i>
                                    </div>
                                    <div className="text-center">
                                        <span className="orbitron font-black text-sm uppercase tracking-[0.2em] block mb-1">Groq Cluster</span>
                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Ultra-Low Latency Inference</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveProvider('gemini')}
                                    className={`p-10 rounded-[40px] border-2 transition-all flex flex-col items-center gap-6 group/btn ${activeProvider === 'gemini'
                                        ? 'bg-[#76b900]/10 border-[#76b900] shadow-[0_20px_60px_rgba(118,185,0,0.2)]'
                                        : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl transition-all ${activeProvider === 'gemini' ? 'bg-[#76b900] text-black shadow-2xl' : 'bg-white/5 text-gray-600'}`}>
                                        <i className="fa-solid fa-brain"></i>
                                    </div>
                                    <div className="text-center">
                                        <span className="orbitron font-black text-sm uppercase tracking-[0.2em] block mb-1">Gemini Pool</span>
                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Multi-Model Reasoning Pool</span>
                                    </div>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[9px] text-[#76b900] font-black uppercase tracking-[0.3em] ml-1">Custom End-Point</label>
                                    <input
                                        type="text"
                                        placeholder="Internal Proxy Link..."
                                        value={llmUrl}
                                        onChange={(e) => setLlmUrl(e.target.value)}
                                        className="w-full p-5 bg-black/80 border border-white/10 rounded-2xl text-gray-200 text-xs outline-none focus:border-[#76b900] font-mono shadow-inner"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] text-[#76b900] font-black uppercase tracking-[0.3em] ml-1">Model ID (Logic)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. llama3-70b-v1"
                                        value={llmModel}
                                        onChange={(e) => setLlmModel(e.target.value)}
                                        className="w-full p-5 bg-black/80 border border-white/10 rounded-2xl text-gray-200 text-xs outline-none focus:border-[#76b900] font-mono shadow-inner"
                                    />
                                </div>
                            </div>
                            <button onClick={saveCoreSettings} className="w-full py-5 bg-[#76b900]/10 border border-[#76b900]/30 text-[#76b900] font-black orbitron text-[10px] tracking-[0.5em] rounded-[30px] hover:bg-[#76b900] hover:text-black transition-all shadow-2xl relative z-10">
                                SYNC_NEURAL_PARAMETERS
                            </button>
                        </div>

                        {/* GREEN CLUSTER - GROQ */}
                        <div className="bg-[#76b900]/5 border border-[#76b900]/10 p-10 rounded-[48px] space-y-10 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#76b900]/10 rounded-xl">
                                        <i className="fa-solid fa-microchip text-[#76b900]"></i>
                                    </div>
                                    <h3 className="text-white font-black orbitron uppercase text-sm tracking-[0.2em]">Logic_Nodes (Groq)</h3>
                                </div>
                                <div className="px-6 py-2 bg-[#76b900]/20 rounded-full border border-[#76b900]/20 text-xs font-black text-[#76b900] tracking-widest">FAILOVER: ACTIVE</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Node_Pool_Status</p>
                                    <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                        {groqKeys.map((k, i) => (
                                            <div key={i} className="flex items-center justify-between bg-black/80 p-4 rounded-2xl border border-white/5 group hover:border-[#76b900]/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${quota.groqIndex === i && activeProvider === 'openai-compatible' ? 'bg-[#76b900] shadow-[0_0_10px_#76b900]' : 'bg-gray-800'}`}></div>
                                                    <span className={`text-[10px] font-mono tracking-widest ${quota.groqIndex === i && activeProvider === 'openai-compatible' ? 'text-[#76b900]' : 'text-gray-500'}`}>{k.substring(0, 15)}...</span>
                                                </div>
                                                <button onClick={() => removeKey('groq', i)} className="text-red-500/20 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-sm"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Initialize_New_Node</p>
                                    <div className="flex gap-3">
                                        <input
                                            type="password"
                                            placeholder="Gsk_Auth_Token..."
                                            value={groqKeyInput}
                                            onChange={e => setGroqKeyInput(e.target.value)}
                                            className="flex-1 p-5 bg-black/80 border border-white/5 rounded-2xl text-[10px] text-[#76b900] outline-none focus:border-[#76b900] font-mono shadow-inner"
                                        />
                                        <button onClick={() => addKey('groq')} className="p-5 bg-white text-black rounded-2xl hover:bg-[#76b900] transition-all shadow-xl"><i className="fa-solid fa-plus font-black"></i></button>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[8px] text-gray-500 font-black italic leading-relaxed uppercase tracking-widest">System will automatically cycle nodes on rate-limit detection. Multi-key setup recommended for Commander class.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VOICE API CENTRAL - CYBER AMBER */}
                        <div className="bg-[#FFB800]/5 border border-[#FFB800]/10 p-10 rounded-[48px] space-y-10 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#FFB800]/10 rounded-xl">
                                        <i className="fa-solid fa-satellite-dish text-[#FFB800]"></i>
                                    </div>
                                    <h3 className="text-white font-black orbitron uppercase text-xs tracking-[0.2em]">Voice_API_Central (Gemini 2.0)</h3>
                                </div>
                                <div className="px-6 py-2 bg-[#FFB800]/20 rounded-full border border-[#FFB800]/20 text-[9px] font-black text-[#FFB800] tracking-widest">NODES: {voiceKeys.length}/3</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Multimodal_Flash_Nodes</p>
                                    <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                        {voiceKeys.length === 0 && <p className="text-[9px] text-gray-600 p-8 border border-white/5 border-dashed rounded-[30px] text-center font-black uppercase tracking-widest">No voice nodes configured</p>}
                                        {voiceKeys.map((k, i) => (
                                            <div key={i} className="flex items-center justify-between bg-black/80 p-4 rounded-2xl border border-white/5 group hover:border-[#FFB800]/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#FFB800] shadow-[0_0_10px_#FFB800]"></div>
                                                    <span className="text-[10px] font-mono tracking-widest text-gray-500 text-clip overflow-hidden">{k.substring(0, 15)}...</span>
                                                </div>
                                                <button onClick={() => removeVoiceKey(i)} className="text-red-500/20 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-sm"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Initialize Voice Node</p>
                                    <div className="flex gap-3">
                                        <input
                                            type="password"
                                            placeholder="Gemini Key (AIza)..."
                                            value={voiceKeyInput}
                                            onChange={e => setVoiceKeyInput(e.target.value)}
                                            className="flex-1 p-5 bg-black/80 border border-white/5 rounded-2xl text-[10px] text-[#FFB800] outline-none focus:border-[#FFB800] font-mono shadow-inner"
                                            disabled={voiceKeys.length >= 3}
                                        />
                                        <button
                                            onClick={addVoiceKey}
                                            className="p-5 bg-white text-black rounded-2xl hover:bg-[#FFB800] transition-all shadow-xl disabled:opacity-50"
                                            disabled={voiceKeys.length >= 3}
                                        >
                                            <i className="fa-solid fa-plus font-black"></i>
                                        </button>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[8px] text-gray-500 font-black italic leading-relaxed uppercase tracking-widest leading-relaxed">System cycles through 3 nodes for local and multimodal voice processing. Free tier limits (1500 RPD) apply per node.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GEMINI POOL - LOGIC ONLY */}
                        <div className="bg-[#76b900]/5 border border-[#76b900]/10 p-10 rounded-[48px] space-y-10 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#76b900]/10 rounded-xl">
                                        <i className="fa-solid fa-brain text-[#76b900]"></i>
                                    </div>
                                    <h3 className="text-white font-black orbitron uppercase text-xs tracking-[0.2em]">Logic_Intelligence (Gemini)</h3>
                                </div>
                                <div className="px-6 py-2 bg-[#76b900]/20 rounded-full border border-[#76b900]/20 text-[9px] font-black text-[#76b900] tracking-widest">SYNC: OPTIMAL</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Active_Pool_Nodes</p>
                                    <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                        {geminiKeys.length === 0 && <p className="text-[9px] text-gray-600 p-8 border border-white/5 border-dashed rounded-[30px] text-center font-black uppercase tracking-widest">No nodes in pool</p>}
                                        {geminiKeys.map((k, i) => (
                                            <div key={i} className="flex items-center justify-between bg-black/80 p-4 rounded-2xl border border-white/5 group hover:border-[#76b900]/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${quota.geminiIndex === i && activeProvider === 'gemini' ? 'bg-[#76b900] shadow-[0_0_10px_#76b900]' : 'bg-gray-800'}`}></div>
                                                    <span className={`text-[10px] font-mono tracking-widest ${quota.geminiIndex === i && activeProvider === 'gemini' ? 'text-[#76b900]' : 'text-gray-500'}`}>{k.substring(0, 15)}...</span>
                                                </div>
                                                <button onClick={() => removeKey('gemini', i)} className="text-red-500/20 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-sm"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Add Pool Node</p>
                                    <div className="flex gap-3">
                                        <input
                                            type="password"
                                            placeholder="AIza_Signature..."
                                            value={geminiKeyInput}
                                            onChange={e => setGeminiKeyInput(e.target.value)}
                                            className="flex-1 p-5 bg-black/80 border border-white/5 rounded-2xl text-[10px] text-[#76b900] outline-none focus:border-[#76b900] font-mono shadow-inner"
                                        />
                                        <button onClick={() => addKey('gemini')} className="p-5 bg-white text-black rounded-2xl hover:bg-[#76b900] transition-all shadow-xl"><i className="fa-solid fa-plus font-black"></i></button>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[8px] text-gray-500 font-black italic leading-relaxed uppercase tracking-widest">Nodes will be balanced across the request-load for maximum reliability.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Critical Actions */}
                        <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 group">
                            <div className="space-y-1 text-center md:text-left">
                                <h3 className="text-red-500 font-black orbitron uppercase text-xs tracking-widest flex items-center gap-3 justify-center md:justify-start">
                                    <i className="fa-solid fa-biohazard animate-pulse"></i> Neural Purge
                                </h3>
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Execute complete memory wipe. Action is irreversible.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all chat history?')) {
                                        onClearChat();
                                    }
                                }}
                                className="px-10 py-5 bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white font-black orbitron text-[10px] tracking-[0.4em] rounded-[30px] transition-all uppercase shadow-2xl active:scale-95"
                            >
                                EXECUTE_PURGE
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsView;
