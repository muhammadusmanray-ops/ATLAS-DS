
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const AutoML: React.FC = () => {
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  const handleTrain = async () => {
    if (!description.trim() || !target.trim()) return;
    setIsTraining(true);
    try {
      const res = await geminiService.trainAutoML(description, target);
      setResult(res || "Training sequence failed.");
    } catch (e) {
      setResult("CRITICAL ERROR: Hyperparameter grid collapse.");
    } finally {
      setIsTraining(false);
    }
  };

  const downloadNotebook = () => {
    if (!result) return;

    // Create a valid Jupyter Notebook JSON structure
    const notebookStructure = {
      "cells": [
        {
          "cell_type": "markdown",
          "metadata": {},
          "source": [
            `# Auto-Generated ML Pipeline by ATLAS-X\n`,
            `## Mission: ${description}\n`,
            `## Target: ${target}\n`,
            `This notebook was architected automatically.`
          ]
        },
        {
          "cell_type": "code",
          "execution_count": null,
          "metadata": {},
          "outputs": [],
          "source": result.split('\n').map(line => line + '\n')
        }
      ],
      "metadata": {
        "kernelspec": {
          "display_name": "Python 3",
          "language": "python",
          "name": "python3"
        },
        "language_info": {
          "codemirror_mode": {
            "name": "ipython",
            "version": 3
          },
          "file_extension": ".py",
          "mimetype": "text/x-python",
          "name": "python",
          "nbconvert_exporter": "python",
          "pygments_lexer": "ipython3",
          "version": "3.8.5"
        }
      },
      "nbformat": 4,
      "nbformat_minor": 4
    };

    const blob = new Blob([JSON.stringify(notebookStructure, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas_automl_mission_${Date.now()}.ipynb`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#020203] overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        <header className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff00ff] to-purple-900 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.3)]">
                <i className="fa-solid fa-dna text-3xl text-white"></i>
            </div>
            <div>
                <h2 className="text-4xl font-black text-white orbitron italic tracking-tight">AutoML<span className="text-[#ff00ff]">_LAB</span></h2>
                <p className="text-gray-400 text-sm mt-1">Automated Model Selection & Hyperparameter Tuning Matrix.</p>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#ff00ff] uppercase tracking-widest">Dataset Context</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your data (e.g., 'Customer telecom churn data with 20 features including tenure, monthly charges...')"
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-gray-300 outline-none focus:border-[#ff00ff] transition-colors resize-none"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#ff00ff] uppercase tracking-widest">Target Variable</label>
                        <input 
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)} 
                            placeholder="e.g. 'Churn' or 'Price'"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-gray-300 outline-none focus:border-[#ff00ff] transition-colors"
                        />
                    </div>

                    <button 
                        onClick={handleTrain}
                        disabled={isTraining || !description || !target}
                        className={`w-full py-4 rounded-xl orbitron font-bold text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${
                            isTraining ? 'bg-gray-800 text-gray-500' : 'bg-[#ff00ff] text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(255,0,255,0.4)]'
                        }`}
                    >
                        {isTraining ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                        {isTraining ? 'OPTIMIZING WEIGHTS...' : 'INITIATE TRAINING'}
                    </button>
                </div>

                <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-3xl">
                    <h4 className="text-indigo-400 font-bold text-xs uppercase mb-2"><i className="fa-solid fa-robot mr-2"></i>Supported Models</h4>
                    <div className="flex flex-wrap gap-2">
                        {['XGBoost', 'CatBoost', 'LightGBM', 'RandomForest', 'NeuralNet'].map(m => (
                            <span key={m} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-mono border border-indigo-500/20">{m}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-2">
                <div className="h-full min-h-[500px] bg-[#050508] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col">
                    <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Training Console Output</span>
                        {result && (
                            <button 
                                onClick={downloadNotebook}
                                className="text-[9px] text-green-400 font-bold uppercase hover:text-white transition-colors flex items-center gap-2 animate-pulse"
                            >
                                <i className="fa-solid fa-download"></i> Download .ipynb
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        {result ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <pre className="bg-transparent p-0 text-gray-300 font-mono text-xs whitespace-pre-wrap">{result}</pre>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                                <div className="relative">
                                    <i className="fa-solid fa-layer-group text-8xl"></i>
                                    {isTraining && <div className="absolute inset-0 border-4 border-[#ff00ff] rounded-full animate-ping"></div>}
                                </div>
                                <p className="orbitron uppercase tracking-widest text-xs">Waiting for Experiment Config</p>
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

export default AutoML;
