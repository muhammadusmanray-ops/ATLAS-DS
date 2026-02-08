
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const SyntheticGenerator: React.FC = () => {
  const [schema, setSchema] = useState('');
  const [count, setCount] = useState(10);
  const [data, setData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!schema.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Generate a synthetic dataset with ${count} rows based on this schema: "${schema}". 
      Return ONLY the data in a clean CSV format. Ensure the data is realistic and varies statistically.`;
      
      const response = await geminiService.chat(prompt);
      setData(response.text || 'Generation failed.');
    } catch (e) {
      console.error(e);
      setData('An error occurred during data generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Synthetic Data Lab</h2>
          <p className="text-gray-500">Generate privacy-safe, realistic datasets for testing and development.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Dataset Schema</label>
                    <textarea
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                        placeholder="e.g. 'User ID, Age, Last Purchase Date, churn_risk (boolean)'"
                        className="w-full h-32 p-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                    />
                    
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Row Count</label>
                    <input 
                        type="number" 
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !schema.trim()}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                            isGenerating ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                        }`}
                    >
                        {isGenerating ? <i className="fa-solid fa-flask-vial animate-pulse"></i> : <i className="fa-solid fa-dna"></i>}
                        {isGenerating ? 'GENESIZING...' : 'GENERATE DATA'}
                    </button>
                </div>
            </div>

            <div className="md:col-span-2">
                <div className="bg-white h-full min-h-[400px] rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generated CSV Output</span>
                        {data && (
                            <button 
                                onClick={() => navigator.clipboard.writeText(data)}
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-2"
                            >
                                <i className="fa-solid fa-copy"></i> Copy CSV
                            </button>
                        )}
                    </div>
                    <div className="flex-1 p-6 font-mono text-xs overflow-auto bg-gray-900 text-green-400 custom-scrollbar">
                        {data ? (
                            <pre className="leading-relaxed">{data}</pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 text-gray-400">
                                <i className="fa-solid fa-table-cells text-6xl mb-4"></i>
                                <p>Synthetic data will appear here.</p>
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

export default SyntheticGenerator;
