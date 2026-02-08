
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { db } from '../services/storage';
import { geminiService } from '../services/gemini';

interface SettingsViewProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onClearChat: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onClearChat }) => {
  const [saved, setSaved] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  
  // Profile State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileRank, setProfileRank] = useState(user?.rank || 'Lead Scientist');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     loadKeys();
  }, []);

  const loadKeys = () => {
      setActiveKeys(geminiService.getMaskedKeys());
  };

  const handleUpdateProfile = () => {
    if (!user) return;
    const updatedUser: User = {
        ...user,
        name: profileName,
        rank: profileRank as 'Commander' | 'Lead Scientist' | 'Junior Intel',
        avatar: profileAvatar
    };
    onUpdateUser(updatedUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAddKey = async () => {
      if(keyInput.length < 10) return;
      await geminiService.addApiKey(keyInput);
      
      // Persist to DB for next session
      const existingKeys = await db.getSettings('api_keys') || [];
      const newKeys = [...existingKeys, keyInput];
      await db.saveSettings('api_keys', newKeys);
      
      setKeyInput('');
      loadKeys(); // Refresh list
      alert("Encryption Key added to Rotation Cluster.");
  };

  const handleRemoveKey = async (index: number) => {
      await geminiService.removeApiKey(index);
      
      // Update DB
      const existingKeys = await db.getSettings('api_keys') || [];
      const newKeys = existingKeys.filter((_: any, i: number) => i !== index);
      await db.saveSettings('api_keys', newKeys);
      
      loadKeys(); // Refresh list
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#020203] overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        <header>
            <h2 className="text-3xl font-black text-white orbitron tracking-tight">System Configuration</h2>
            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Global Preferences & Identity Management</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Identity Module */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-id-card text-[#ff00ff] text-xl"></i>
                    <label className="text-sm font-bold text-white uppercase tracking-wider">Identity Matrix</label>
                </div>
                
                <div className="flex items-center gap-6 mb-6">
                    <div className="relative group">
                        <img src={profileAvatar} alt="Profile" className="w-20 h-20 rounded-2xl border-2 border-[#ff00ff]/30 object-cover" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                        >
                            <i className="fa-solid fa-camera text-white"></i>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Current Clearance</p>
                        <p className="text-white font-bold orbitron text-lg">{user?.rank}</p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[9px] text-[#ff00ff] hover:text-white uppercase tracking-widest font-bold mt-1"
                        >
                            Change Photo
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest">Codename</label>
                        <input 
                            type="text" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-gray-200 text-xs outline-none focus:border-[#ff00ff]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest">Rank Designation</label>
                        <select 
                            value={profileRank}
                            onChange={(e) => setProfileRank(e.target.value as 'Commander' | 'Lead Scientist' | 'Junior Intel')}
                            className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-gray-200 text-xs outline-none focus:border-[#ff00ff]"
                        >
                            <option value="Junior Intel">Junior Intel</option>
                            <option value="Lead Scientist">Lead Scientist</option>
                            <option value="Commander">Commander</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleUpdateProfile}
                        className="w-full py-3 bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/20 font-bold orbitron text-[10px] tracking-widest rounded-xl hover:bg-[#ff00ff] hover:text-black transition-all"
                    >
                        {saved ? 'IDENTITY UPDATED' : 'UPDATE IDENTITY'}
                    </button>
                </div>
            </div>

            {/* Right Column: API & Data */}
            <div className="space-y-8">
                
                {/* API Load Balancer UI */}
                <div className="bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-3xl">
                    <h3 className="text-indigo-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-server"></i> API Cluster Node
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] text-gray-400">Total Capacity</span>
                        <span className="text-xl font-black text-white orbitron">{activeKeys.length} <span className="text-[10px] text-gray-500">keys loaded</span></span>
                    </div>
                    
                    <div className="space-y-3">
                         {/* Key List */}
                         <div className="bg-black/30 rounded-xl p-3 max-h-32 overflow-y-auto custom-scrollbar space-y-2 border border-white/5">
                            {activeKeys.length === 0 && <p className="text-[9px] text-gray-500 text-center py-2">No keys in cluster.</p>}
                            {activeKeys.map((k, i) => (
                                <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-mono text-indigo-200">{k}</span>
                                    </div>
                                    <button onClick={() => handleRemoveKey(i)} className="text-red-500 hover:text-red-400 text-[10px]">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            ))}
                         </div>

                        <div className="flex justify-between items-center px-1 mt-4">
                            <label className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Add New Key</label>
                            <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] text-indigo-400 hover:text-white underline decoration-dashed"
                            >
                                Get Google Key
                            </a>
                        </div>
                        <input 
                             type="password"
                             value={keyInput}
                             onChange={e => setKeyInput(e.target.value)}
                             placeholder="Paste Key (AIza...)"
                             className="w-full p-3 bg-black/50 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 outline-none focus:border-indigo-400 font-mono"
                        />
                        <button 
                             onClick={handleAddKey}
                             className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] tracking-widest rounded-xl transition-all uppercase"
                        >
                            <i className="fa-solid fa-plus mr-2"></i> Add Node to Cluster
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl">
                    <h3 className="text-red-500 font-bold uppercase text-xs tracking-widest mb-4"><i className="fa-solid fa-trash-can mr-2"></i>Data Sanitation</h3>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-gray-400 text-xs">Clear all local chat logs.</p>
                        <button 
                            onClick={() => {
                                if(window.confirm('Clear all chat history?')) {
                                    onClearChat();
                                    alert('History Neutralized.');
                                }
                            }}
                            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold orbitron text-[10px] tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] whitespace-nowrap"
                        >
                            PURGE HISTORY
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsView;
