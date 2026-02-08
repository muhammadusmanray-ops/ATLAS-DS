
import React, { useState, useEffect } from 'react';
import { NotebookCell } from '../types';
import { geminiService } from '../services/gemini';
import { db } from '../services/storage';

const NotebookView: React.FC = () => {
  const [cells, setCells] = useState<NotebookCell[]>([
    { id: '1', type: 'markdown', content: '# Operation: Titan Analysis\nInitialize environment and load core libraries.' },
    { id: '2', type: 'code', content: 'import pandas as pd\nimport numpy as np\n\n# Defining a global variable for testing persistence\ntactical_value = 42\nprint("Environment Initialized. Tactical Value set.")' }
  ]);
  const [activeCell, setActiveCell] = useState<string | null>(null);

  // Load from DB on mount
  useEffect(() => {
    const loadNotebook = async () => {
        const savedCells = await db.getNotebook();
        if (savedCells && savedCells.length > 0) {
            setCells(savedCells);
        }
    };
    loadNotebook();
  }, []);

  // Save to DB on change
  useEffect(() => {
    if (cells.length > 0) {
        db.saveNotebook(cells);
    }
  }, [cells]);

  const addCell = (type: 'code' | 'markdown') => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type,
      content: ''
    };
    setCells([...cells, newCell]);
  };

  const executeCell = async (id: string) => {
    const cellIndex = cells.findIndex(c => c.id === id);
    if (cellIndex === -1) return;

    const cell = cells[cellIndex];
    if (cell.type === 'markdown') return;

    // Update state to executing
    const updatedCells = [...cells];
    updatedCells[cellIndex].isExecuting = true;
    setCells(updatedCells);

    try {
      // SMART CONTEXT: Gather all *code* from previous cells to simulate memory
      const previousCode = cells
        .slice(0, cellIndex)
        .filter(c => c.type === 'code')
        .map(c => c.content)
        .join('\n');

      const output = await geminiService.simulatePythonExecution(cell.content, previousCode);
      
      setCells(prev => {
        const newCells = [...prev];
        newCells[cellIndex].isExecuting = false;
        newCells[cellIndex].output = output;
        return newCells;
      });
    } catch (e) {
      setCells(prev => {
        const newCells = [...prev];
        newCells[cellIndex].isExecuting = false;
        newCells[cellIndex].output = "KERNEL_PANIC: Connection to simulation engine lost.";
        return newCells;
      });
    }
  };

  const updateCellContent = (id: string, content: string) => {
    setCells(cells.map(c => c.id === id ? { ...c, content } : c));
  };

  const deleteCell = (id: string) => {
    setCells(cells.filter(c => c.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0d12] text-gray-300 font-mono text-sm overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4 bg-[#111116]">
            <span className="text-xs font-bold text-[#00f3ff] uppercase tracking-widest"><i className="fa-brands fa-python mr-2"></i>Quantum Kernel</span>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <button onClick={() => addCell('code')} className="hover:text-white transition-colors"><i className="fa-solid fa-plus mr-2"></i>Code</button>
            <button onClick={() => addCell('markdown')} className="hover:text-white transition-colors"><i className="fa-solid fa-paragraph mr-2"></i>Text</button>
            <div className="flex-1"></div>
            <span className="text-[10px] text-green-500 uppercase tracking-widest animate-pulse">● Kernel Active (Memory Persisted)</span>
        </div>

        {/* Cells Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {cells.map((cell, index) => (
                    <div key={cell.id} className={`group relative rounded-lg border transition-all ${activeCell === cell.id ? 'border-[#00f3ff]/50 shadow-[0_0_15px_rgba(0,243,255,0.1)]' : 'border-transparent hover:border-white/10'}`}>
                        {/* Cell Execution Order Indicator */}
                        {cell.type === 'code' && (
                             <div className="absolute -left-16 top-4 text-[9px] font-bold text-gray-600 font-mono">
                                In [{index + 1}]:
                             </div>
                        )}

                        {/* Cell Sidebar (Run/Delete) */}
                        <div className="absolute -left-10 top-0 bottom-0 w-10 flex flex-col items-end py-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {cell.type === 'code' && (
                                <button onClick={() => executeCell(cell.id)} className="w-8 h-8 rounded bg-[#1e1e24] hover:bg-[#00f3ff] hover:text-black text-gray-500 flex items-center justify-center transition-colors shadow-lg">
                                    {cell.isExecuting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play text-xs"></i>}
                                </button>
                            )}
                            <button onClick={() => deleteCell(cell.id)} className="w-8 h-8 rounded bg-[#1e1e24] hover:bg-red-500 hover:text-white text-gray-500 flex items-center justify-center transition-colors shadow-lg">
                                <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>

                        {/* Input Area */}
                        <div 
                            className={`w-full bg-[#111116] rounded-t-lg p-4 min-h-[60px] ${cell.type === 'markdown' ? 'text-gray-400 font-sans' : 'text-[#a5b3ce] font-mono'}`}
                            onClick={() => setActiveCell(cell.id)}
                        >
                            <div className="flex items-center gap-2 mb-2 select-none">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${cell.type === 'code' ? 'text-blue-500' : 'text-gray-600'}`}>
                                    {cell.type === 'code' ? 'PYTHON CODE' : 'MARKDOWN'}
                                </span>
                            </div>
                            <textarea 
                                value={cell.content}
                                onChange={(e) => updateCellContent(cell.id, e.target.value)}
                                className="w-full bg-transparent outline-none resize-none h-auto min-h-[100px]"
                                spellCheck={false}
                                placeholder={cell.type === 'code' ? 'print("Hello Atlas")' : '# Documentation'}
                            />
                        </div>

                        {/* Output Area */}
                        {cell.output && (
                            <div className="bg-[#050508] border-t border-white/5 p-4 rounded-b-lg overflow-x-auto relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50"></div>
                                <div className="flex items-center gap-2 mb-2 select-none">
                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Out [{index + 1}]:</span>
                                </div>
                                <pre className="text-xs text-green-400 whitespace-pre-wrap">{cell.output}</pre>
                            </div>
                        )}
                    </div>
                ))}

                <div className="py-20 flex flex-col items-center justify-center opacity-20 hover:opacity-50 transition-opacity cursor-pointer border-2 border-dashed border-gray-700 rounded-xl" onClick={() => addCell('code')}>
                    <i className="fa-solid fa-plus text-4xl mb-2 text-[#00f3ff]"></i>
                    <span className="text-xs uppercase tracking-widest text-gray-400">Add Tactical Code Block</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default NotebookView;
