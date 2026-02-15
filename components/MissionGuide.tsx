
import React, { useState } from 'react';

interface MissionGuideProps {
    currentView: string;
}

const MissionGuide: React.FC<MissionGuideProps> = ({ currentView }) => {
    const [isOpen, setIsOpen] = useState(false);

    const guides: Record<string, { title: string; urdu: string; purpose: string }> = {
        chat: {
            title: 'Tactical Core',
            urdu: 'تیز رفتار جوابات',
            purpose: 'Code debugging, quick questions, aur programming help ke liye. Ye Groq (Llama 3.3) use karta hai jo bohot tez hai.'
        },
        architect: {
            title: 'War Room',
            urdu: 'مشین لرننگ ڈیزائن',
            purpose: 'Jab aapko kisi ML project ka poora blueprint chahiye (Data → Model → Deployment). Interview ke liye portfolio banane mein madad karta hai.'
        },
        devops: {
            title: 'Production Hub',
            urdu: 'انڈسٹری فائلیں',
            purpose: 'Asli industry files (Dockerfile, CI/CD) generate karta hai. Ye files aapko "Junior" se "Senior" level tak le jati hain kyunke ye production deployment dikhati hain.'
        },
        vision: {
            title: 'Visual HUD',
            urdu: 'تصویر تجزیہ',
            purpose: 'Charts, graphs, ya koi bhi image upload kar ke analysis le sakte hain. Research papers ke diagrams samajhne ke liye best hai.'
        },
        grounding: {
            title: 'Deep Grounding',
            urdu: 'لائیو ڈیٹا تلاش',
            purpose: 'Real-time web search + verified sources. Latest datasets (Kaggle) ya research papers dhoondhne ke liye.'
        },
        career: {
            title: 'Career Ops',
            urdu: 'ملازمت تلاش',
            purpose: 'Job search aur proposal writing. Upwork/Fiverr ke liye professional proposals bhi likh sakta hai.'
        },
        notebook: {
            title: 'Quantum Notebook',
            urdu: 'کوڈ چلائیں',
            purpose: 'Browser mein Python code execute karo. Data analysis aur quick experiments ke liye.'
        },
        live: {
            title: 'Voice Comms',
            urdu: 'آواز سے بات',
            purpose: 'Hands-free consultation. Driving ya walk karte waqt AI se baat kar sakte hain (8+ hours).'
        }
    };

    const currentGuide = guides[currentView] || {
        title: 'Mission Control',
        urdu: 'کنٹرول سینٹر',
        purpose: 'System overview aur quick navigation.'
    };

    const fileGuides = [
        { name: 'Dockerfile', purpose: 'Aapke app ko kisi bhi computer par chalane ke liye "container" banata hai. Industry standard hai.' },
        { name: 'docker-compose.yml', purpose: 'Multiple services (database, API, cache) ko ek sath chalata hai. Local testing ke liye.' },
        { name: 'deploy.sh', purpose: 'Cloud (AWS/GCP) par upload karne ke liye automated script.' },
        { name: '.github/workflows', purpose: 'Har code push par automatic testing aur deployment. CI/CD pipeline.' }
    ];

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-[#00f3ff] shadow-2xl shadow-indigo-500/50 flex items-center justify-center text-white hover:scale-110 transition-all z-50 group"
            >
                {isOpen ? (
                    <i className="fa-solid fa-xmark text-2xl"></i>
                ) : (
                    <div className="relative">
                        <i className="fa-solid fa-question text-2xl group-hover:rotate-12 transition-transform"></i>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    </div>
                )}
            </button>

            {/* Guide Panel */}
            {isOpen && (
                <div className="fixed bottom-28 right-8 w-96 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-[30px] shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-[#00f3ff] p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <i className="fa-solid fa-compass text-white text-2xl"></i>
                            <h3 className="text-white font-black orbitron text-lg">Mission Guide</h3>
                        </div>
                        <p className="text-white/80 text-xs font-mono">Aapka personal navigation assistant</p>
                    </div>

                    {/* Current Section Info */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] orbitron text-gray-500 uppercase tracking-widest">Current Section</span>
                            <span className="text-xs text-[#00f3ff] font-mono">{currentGuide.urdu}</span>
                        </div>
                        <h4 className="text-white font-black text-sm mb-2">{currentGuide.title}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">{currentGuide.purpose}</p>
                    </div>

                    {/* File Purpose Guide */}
                    <div className="p-6">
                        <h5 className="text-[10px] orbitron text-gray-500 uppercase tracking-widest mb-4">Production Files Guide</h5>
                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                            {fileGuides.map((file, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-[#00f3ff]/30 transition-all group">
                                    <div className="flex items-start gap-3">
                                        <i className="fa-solid fa-file-code text-indigo-400 mt-1 group-hover:text-[#00f3ff] transition-colors"></i>
                                        <div className="flex-1">
                                            <p className="text-white text-xs font-bold mb-1">{file.name}</p>
                                            <p className="text-gray-500 text-[10px] leading-relaxed">{file.purpose}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="p-6 bg-indigo-500/10 border-t border-indigo-500/20">
                        <div className="flex items-start gap-3">
                            <i className="fa-solid fa-lightbulb text-yellow-400 text-sm mt-0.5"></i>
                            <div>
                                <p className="text-white text-xs font-bold mb-1">Pro Tip</p>
                                <p className="text-gray-400 text-[10px] leading-relaxed">
                                    Agar job interview ke liye portfolio chahiye, toh <span className="text-[#00f3ff] font-bold">War Room</span> use karo.
                                    Agar code test karna hai, toh <span className="text-[#00f3ff] font-bold">Quantum Notebook</span> best hai.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MissionGuide;
