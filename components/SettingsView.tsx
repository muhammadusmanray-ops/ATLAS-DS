
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { db } from '../services/storage';
import { llmAdapter } from '../services/llm';
import { authService } from '../services/authService';

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

        try {
            // TRIPLE PERSISTENCE: localStorage + IndexedDB + Supabase Cloud
            localStorage.setItem('ATLAS_USER_SESSION', JSON.stringify(updatedUser));
            await db.saveUser(updatedUser);
            await authService.updateProfile({
                name: profileName,
                rank: profileRank,
                avatar: profileAvatar
            });

            onUpdateUser(updatedUser);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("FAILED_TO_SYNC_PROFILE:", err);
            alert("Database Sync Failed. Check Connection.");
        }
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
        <div className="h-full overflow-y-auto custom-scrollbar flex flex-col p-8 bg-[#020204] relative selection:bg-[#76b900] selection:text-black font-sans min-h-0">
            <div className="max-w-6xl mx-auto w-full space-y-12 pb-32">
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

                    {/* Profile Section - Identity Sector */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-8 backdrop-blur-3xl shadow-2xl h-fit relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                                <i className="fa-solid fa-id-card text-8xl text-white"></i>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                <i className="fa-solid fa-id-badge text-[#76b900] text-xl"></i>
                                <h3 className="text-sm font-black text-white orbitron uppercase tracking-widest">Active Commander ID</h3>
                            </div>

                            <div className="flex flex-col items-center gap-6 py-4 relative z-10">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-[40px] p-1 bg-[#76b900]/20 border border-[#76b900]/40 overflow-hidden shadow-[0_0_30px_rgba(118,185,0,0.3)] group-hover:shadow-[0_0_50px_rgba(118,185,0,0.5)] transition-all">
                                        <img src={profileAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.name} alt="Profile" className="w-full h-full rounded-[35px] object-cover" />
                                    </div>
                                    <div className="absolute inset-0 bg-[#76b900]/60 rounded-[40px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-camera text-black text-2xl"></i>
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
                                        placeholder="Enter Name..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] ml-1">Designation</label>
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
                                    {saved ? 'ID_SYNCHRONIZED' : 'SAVE_COMMAND_DATA'}
                                </button>
                            </div>
                        </div>

                        {/* MASTER PROJECT LICENSE - PERMANENT BRANDING */}
                        <div className="bg-gradient-to-br from-[#0a0f1d] via-[#020205] to-[#0a0f1d] border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden group min-h-[220px]">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[7px] font-black orbitron uppercase tracking-widest border border-blue-500/30">
                                <i className="fa-solid fa-award"></i> MASTER LICENSE
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black text-white orbitron uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                                    <i className="fa-solid fa-copyright text-blue-400"></i> Project Architecture
                                </h3>

                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] flex-shrink-0">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Usman&mood=happy&backgroundColor=0a0f1d" alt="M U RAY" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-white orbitron font-black text-sm tracking-widest uppercase">M U RAY</p>
                                            <p className="text-[8px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">Foundational Visionary</p>
                                            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.1em] mt-2 italic">Official System Protocol © 2026</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/5">
                                        <a href="https://instagram.com/muhammadusmanray" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all group/icon">
                                            <i className="fa-brands fa-instagram text-gray-500 group-hover/icon:text-pink-500 text-lg transition-colors"></i>
                                            <span className="text-[6px] orbitron font-black text-gray-700 group-hover/icon:text-pink-500 uppercase">Insta</span>
                                        </a>
                                        <a href="https://wa.me/923070417933" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-green-500/50 hover:bg-green-500/10 transition-all group/icon">
                                            <i className="fa-brands fa-whatsapp text-gray-500 group-hover/icon:text-green-500 text-lg transition-colors"></i>
                                            <span className="text-[6px] orbitron font-black text-gray-700 group-hover/icon:text-green-500 uppercase">WA</span>
                                        </a>
                                        <a href="https://linkedin.com/in/muhammadusmanray" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group/icon">
                                            <i className="fa-brands fa-linkedin text-gray-500 group-hover/icon:text-blue-500 text-lg transition-colors"></i>
                                            <span className="text-[6px] orbitron font-black text-gray-700 group-hover/icon:text-blue-500 uppercase">Link</span>
                                        </a>
                                        <a href="tel:+923070417933" className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-[#76b900]/50 hover:bg-[#76b900]/10 transition-all group/icon">
                                            <i className="fa-solid fa-phone text-gray-500 group-hover/icon:text-[#76b900] text-lg transition-colors"></i>
                                            <span className="text-[6px] orbitron font-black text-gray-700 group-hover/icon:text-[#76b900] uppercase">Dial</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Stats Card */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-3xl shadow-2xl">
                            <h3 className="text-[10px] font-black text-white orbitron uppercase tracking-[0.3em] flex items-center gap-3">
                                <i className="fa-solid fa-chart-line text-[#76b900]"></i> Global Efficiency
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-[#76b900]/30 transition-colors">
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Logic Accuracy</p>
                                    <p className="text-[#76b900] orbitron font-black text-lg">99.2%</p>
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-[#76b900]/30 transition-colors">
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Latency Link</p>
                                    <p className="text-[#76b900] orbitron font-black text-lg">LOW</p>
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
                                    <div className="w-12 h-12 bg-[#76b900]/10 rounded-2xl border border-[#76b900]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {profileAvatar ? (
                                            <img src={profileAvatar} className="w-full h-full object-cover" alt="Profile" />
                                        ) : (
                                            <span className="text-[#76b900] font-black orbitron text-xl">{profileName?.[0] || 'A'}</span>
                                        )}
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
