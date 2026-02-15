
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { kaggleService, CompetitionMetadata } from '../services/kaggle';
import { notificationService, NotificationPreferences } from '../services/notifications';

const KaggleHub: React.FC = () => {
    const [selectedMission, setSelectedMission] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [definition, setDefinition] = useState<string | null>(null);

    // Social Warfare State
    const [socialPost, setSocialPost] = useState<string | null>(null);

    // Live Kaggle Data
    const [missions, setMissions] = useState<CompetitionMetadata[]>([]);
    const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(true);

    // Notification Settings
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
        emailAlerts: false,
        browserNotifications: true,
        deadlineReminders: true,
        newCompetitionAlerts: true,
    });

    // Load competitions on mount
    useEffect(() => {
        loadCompetitions();
        initializeNotifications();
    }, []);

    const loadCompetitions = async () => {
        setIsLoadingCompetitions(true);
        try {
            const comps = await kaggleService.getCompetitions();
            setMissions(comps);

            // Show notification if there are new competitions
            const newComps = comps.filter(c => c.daysLeft <= 7 && c.prize !== 'Knowledge');
            if (newComps.length > 0) {
                notificationService.sendBrowserNotification(
                    '🏆 New Kaggle Competitions!',
                    `${newComps.length} new competitions with prizes available!`
                );
            }
        } catch (error) {
            console.error('Failed to load competitions:', error);
        } finally {
            setIsLoadingCompetitions(false);
        }
    };

    const initializeNotifications = async () => {
        await notificationService.initialize();
        notificationService.startPeriodicChecks();

        // Load saved preferences
        const saved = localStorage.getItem('notificationPreferences');
        if (saved) {
            setNotificationPrefs(JSON.parse(saved));
        }
    };

    const updateNotificationPrefs = (prefs: Partial<NotificationPreferences>) => {
        const updated = { ...notificationPrefs, ...prefs };
        setNotificationPrefs(updated);
        notificationService.updatePreferences(updated);
    };


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
        if (!searchTerm) return;
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
                <header className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-white orbitron italic tracking-tight uppercase">Kaggle<span className="text-[#00f3ff]">_OPS</span></h2>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-pulse"></div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Live Competition Tracker & Strategy Guide</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={loadCompetitions}
                            disabled={isLoadingCompetitions}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] orbitron font-black text-gray-500 uppercase tracking-widest hover:text-white hover:border-[#00f3ff] transition-all flex items-center gap-3 backdrop-blur-xl"
                        >
                            <i className={`fa-solid fa-rotate ${isLoadingCompetitions ? 'fa-spin' : ''}`}></i>
                            Sync
                        </button>
                        <button
                            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                            className={`px-6 py-3 border rounded-2xl text-[9px] orbitron font-black uppercase tracking-widest transition-all flex items-center gap-3 backdrop-blur-xl ${showNotificationSettings ? 'bg-[#00f3ff] text-black border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.4)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-[#00f3ff]'}`}
                        >
                            <i className="fa-solid fa-bell"></i>
                            Alerts
                        </button>
                    </div>
                </header>

                {/* Notification Settings Panel */}
                {showNotificationSettings && (
                    <div className="bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-[40px] p-8 animate-in fade-in slide-in-from-top-4 backdrop-blur-2xl">
                        <h3 className="text-[#00f3ff] font-black orbitron uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-3">
                            <i className="fa-solid fa-shield-halved"></i> Notification_Parameters
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { id: 'browser', label: 'Tactical HUD Alerts', desc: 'Real-time desktop telemetry for new missions', checked: notificationPrefs.browserNotifications, key: 'browserNotifications' },
                                { id: 'deadlines', label: 'Temporal Reminders', desc: 'Critical alert 72h before mission expiration', checked: notificationPrefs.deadlineReminders, key: 'deadlineReminders' },
                                { id: 'new', label: 'Sector Scan Alerts', desc: 'Notify when new competition nodes manifest', checked: notificationPrefs.newCompetitionAlerts, key: 'newCompetitionAlerts' },
                                { id: 'email', label: 'Off-Grid Comms', desc: 'Daily intelligence digest via secure email', checked: notificationPrefs.emailAlerts, key: 'emailAlerts' }
                            ].map(pref => (
                                <label key={pref.id} className="flex items-center gap-4 p-5 bg-black/40 border border-white/5 rounded-3xl cursor-pointer hover:border-[#00f3ff]/30 transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={pref.checked}
                                        onChange={(e) => updateNotificationPrefs({ [pref.key]: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-white/10 bg-transparent text-[#00f3ff] focus:ring-0 focus:ring-offset-0"
                                    />
                                    <div>
                                        <p className="text-white text-[11px] font-black orbitron uppercase tracking-widest group-hover:text-[#00f3ff] transition-colors">{pref.label}</p>
                                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mt-1 mt-1">{pref.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {notificationPrefs.emailAlerts && (
                            <div className="mt-6 flex gap-4">
                                <input
                                    type="email"
                                    placeholder="COMMANDER@ATLAS.X"
                                    value={notificationPrefs.userEmail || ''}
                                    onChange={(e) => updateNotificationPrefs({ userEmail: e.target.value })}
                                    className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-[#00f3ff] outline-none transition-all font-mono"
                                />
                                <button className="px-8 bg-[#00f3ff] text-black font-black orbitron text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white transition-all">Link</button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Col: Missions */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl">
                            <h3 className="text-xs font-black text-white orbitron uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-radar text-[#00f3ff]"></i> Live_Missions
                            </h3>
                            <div className="space-y-4">
                                {missions.map(m => (
                                    <div
                                        key={m.id}
                                        className={`w-full text-left p-6 rounded-[32px] border transition-all duration-500 group ${selectedMission === m.title
                                            ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_25px_rgba(0,243,255,0.2)]'
                                            : 'bg-black/40 border-white/5 hover:border-[#00f3ff]/30'
                                            }`}
                                    >
                                        <button
                                            onClick={() => generateMissionCode(m.title)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-black text-white text-[12px] uppercase orbitron tracking-tight leading-tight group-hover:text-[#00f3ff] transition-colors">{m.title}</h4>
                                                <span className={`text-[8px] px-2.5 py-1 rounded-lg border orbitron font-black uppercase tracking-widest shrink-0 ml-4 ${m.diff === 'Beginner' ? 'border-green-500/30 text-green-400 bg-green-500/5' :
                                                    m.diff === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' :
                                                        'border-red-500/30 text-red-400 bg-red-500/5'
                                                    }`}>{m.diff}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mb-5 font-medium leading-relaxed uppercase tracking-tighter">{m.desc}</p>
                                        </button>

                                        {/* Competition Metadata */}
                                        <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/5">
                                            <div className="text-center">
                                                <p className="text-[6px] orbitron font-black text-gray-600 uppercase tracking-widest mb-1">Time_Left</p>
                                                <p className="text-[10px] text-white font-black orbitron">{m.deadline}</p>
                                            </div>
                                            <div className="text-center border-x border-white/5">
                                                <p className="text-[6px] orbitron font-black text-gray-600 uppercase tracking-widest mb-1">Prize_Pool</p>
                                                <p className="text-[10px] text-[#00f3ff] font-black orbitron">{m.prize}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[6px] orbitron font-black text-gray-600 uppercase tracking-widest mb-1">Operators</p>
                                                <p className="text-[10px] text-white font-black orbitron">{m.participants}</p>
                                            </div>
                                        </div>

                                        {/* Kaggle Link */}
                                        <a
                                            href={m.kaggleUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 flex items-center justify-center gap-2 text-[8px] orbitron font-black text-gray-600 hover:text-[#00f3ff] transition-all uppercase tracking-widest"
                                        >
                                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                            Portal_Access
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Terminology Scanner */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl">
                            <h3 className="text-xs font-black text-white orbitron uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <i className="fa-solid fa-terminal text-[#00f3ff]"></i> Concept_Decrypter
                            </h3>
                            <div className="flex gap-3 mb-6">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Enter encrypted term..."
                                    className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:border-[#00f3ff] outline-none transition-all placeholder:text-gray-800 font-mono"
                                />
                                <button
                                    onClick={explainTerm}
                                    className="w-14 h-14 bg-[#00f3ff]/10 text-[#00f3ff] rounded-2xl border border-[#00f3ff]/30 hover:bg-[#00f3ff] hover:text-black transition-all flex items-center justify-center shadow-xl active:scale-90"
                                >
                                    <i className="fa-solid fa-bolt"></i>
                                </button>
                            </div>
                            {definition && (
                                <div className="p-6 bg-black/40 rounded-[24px] border border-[#00f3ff]/20 text-[11px] text-gray-300 animate-in fade-in leading-relaxed shadow-inner">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00f3ff]"></div>
                                        <span className="orbitron font-black text-[#00f3ff] text-[8px] uppercase tracking-widest">Synthesis_Result:</span>
                                    </div>
                                    {definition}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Code & Strategy */}
                    <div className="lg:col-span-8">
                        <div className="h-full min-h-[700px] bg-[#050508] border border-white/10 rounded-[48px] relative overflow-hidden flex flex-col shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 border border-yellow-400/20">
                                        <i className="fa-brands fa-python text-lg"></i>
                                    </div>
                                    <div>
                                        <span className="text-[10px] orbitron font-black text-gray-500 uppercase tracking-[0.2em]">Strategy_Synthesis_Node</span>
                                        <h4 className="text-xs font-black text-white uppercase orbitron tracking-widest mt-0.5">
                                            {selectedMission ? `GENERATING: ${selectedMission}` : 'AWAITING_MISSION_TARGET'}
                                        </h4>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {generatedCode && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedCode);
                                                }}
                                                className="px-5 py-2 bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black rounded-full text-[9px] orbitron font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-[#00f3ff]/30 shadow-xl"
                                            >
                                                <i className="fa-solid fa-copy"></i> Copy
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const blob = new Blob([generatedCode], { type: 'text/plain' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `kaggle_${selectedMission?.toLowerCase().replace(/\s+/g, '_')}.py`;
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                                className="px-5 py-2 bg-white/5 text-gray-400 hover:bg-white hover:text-black rounded-full text-[9px] orbitron font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-white/10 shadow-xl"
                                            >
                                                <i className="fa-solid fa-download"></i> Save
                                            </button>

                                            <button
                                                onClick={generateLinkedInPost}
                                                className="px-5 py-2 bg-[#00f3ff] text-black hover:bg-white rounded-full text-[9px] orbitron font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                                            >
                                                <i className="fa-brands fa-linkedin"></i> Share
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-0 overflow-y-auto custom-scrollbar relative bg-[#070709]">
                                {generatedCode ? (
                                    <div className="p-10 space-y-10">
                                        {/* Social Warfare Panel */}
                                        {socialPost && (
                                            <div className="bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-[32px] p-8 animate-in fade-in slide-in-from-top-4 backdrop-blur-md relative group">
                                                <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                                                    <i className="fa-solid fa-satellite-dish text-[#00f3ff] text-2xl opacity-20"></i>
                                                </div>
                                                <h4 className="text-[#00f3ff] font-black orbitron uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-3">
                                                    <i className="fa-solid fa-bullhorn"></i> Social_Warfare_Payload
                                                </h4>
                                                <div className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed p-8 bg-black/60 rounded-[24px] border border-white/5 shadow-inner selection:bg-[#00f3ff] selection:text-black">
                                                    {socialPost}
                                                </div>
                                            </div>
                                        )}

                                        {/* Submission Guide */}
                                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                                            <h4 className="text-white font-black orbitron uppercase text-[10px] tracking-[0.3em] mb-8 flex items-center gap-3">
                                                <i className="fa-solid fa-chess-knight text-[#00f3ff]"></i> Tactical_Deployment_Protocol
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                {submissionSteps.map((step, idx) => (
                                                    <div key={idx} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:border-[#00f3ff]/30 transition-all">
                                                        <i className={`fa-solid ${step.icon} text-[#00f3ff] mb-3 text-lg opacity-40 group-hover:opacity-100 transition-all`}></i>
                                                        <span className="text-[9px] orbitron font-black text-white uppercase tracking-widest mb-2">{step.title}</span>
                                                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{step.desc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f3ff]/20 to-transparent rounded-[32px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                            <pre className="font-mono text-xs text-green-400/90 whitespace-pre-wrap leading-relaxed p-10 bg-black rounded-[32px] border border-white/5 relative selection:bg-green-500 selection:text-black">
                                                {generatedCode}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 space-y-8">
                                        {isLoading ? (
                                            <>
                                                <div className="relative">
                                                    <i className="fa-solid fa-atom fa-spin text-9xl text-[#00f3ff]"></i>
                                                    <div className="absolute inset-0 animate-ping border-4 border-[#00f3ff]/20 rounded-full"></div>
                                                </div>
                                                <p className="orbitron font-black uppercase tracking-[0.5em] text-xs text-white animate-pulse">Deep_Neural_Sequencing...</p>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-chess-board text-9xl text-white"></i>
                                                <p className="orbitron font-black uppercase tracking-[0.5em] text-xs text-white">AWAITING_MISSION_DEPLOYMENT</p>
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
