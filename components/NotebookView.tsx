import React, { useState, useEffect } from 'react';
import { NotebookCell } from '../types';
import { llmAdapter } from '../services/llm';
import { db } from '../services/storage';
import DatabaseModal from './DatabaseModal';

const NotebookView: React.FC = () => {
  const [cells, setCells] = useState<NotebookCell[]>([
    { id: '1', type: 'markdown', content: '# Mission: Tactical Data Analysis\nAnalysis of raw signals from the 2026 border sector. Initializing scientific modules.' },
    { id: '2', type: 'code', content: 'import pandas as pd\n\n# Simulating high-frequency sensor data\ndata = {\n    "Sector": ["Alpha", "Bravo", "Gamma", "Delta"],\n    "Signal_Strength": [98.2, 45.1, 88.5, 32.7],\n    "Status": ["STABLE", "JAMMED", "STABLE", "FAIL"]\n}\ndf = pd.DataFrame(data)\nprint(df.to_string())' }
  ]);
  const [activeCell, setActiveCell] = useState<string | null>(null);

  // High-Level Features: State & Variables
  const [variables, setVariables] = useState<Array<{ name: string; type: string; value: string }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [executionMode, setExecutionMode] = useState<'ai' | 'real'>('ai'); // AI or Real Python
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const exportNotebook = () => {
    const data = {
      cells: cells.map(c => ({
        cell_type: c.type,
        metadata: {},
        source: [c.content],
        outputs: c.output ? [{ output_type: 'stream', text: [c.output] }] : []
      })),
      metadata: { kernelspec: { display_name: "Llama-4 Maverick", language: "python" } },
      nbformat: 4,
      nbformat_minor: 4
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/x-ipynb+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas_mission_protocol_${Date.now()}.ipynb`;
    a.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newCell: NotebookCell = {
        id: Date.now().toString(),
        type: 'code',
        content: `# INGESTED DATA: ${file.name}\nraw_data = """${content.substring(0, 1000)}..."""\n# Coding Logic Starts Here...`,
        output: `Data Node [${file.name}] linked. Metadata extracted.`
      };
      setCells([...cells, newCell]);
    };
    reader.readAsText(file);
  };

  // Load from DB
  useEffect(() => {
    const loadNotebook = async () => {
      const savedCells = await db.getNotebook();
      if (savedCells && savedCells.length > 0) {
        setCells(savedCells);
      }
    };
    loadNotebook();
  }, []);

  // Save to DB
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

    const updatedCells = [...cells];
    updatedCells[cellIndex].isExecuting = true;
    setCells(updatedCells);

    try {
      let output = '';
      if (executionMode === 'real') {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const PROXY_URL = isLocal ? 'http://localhost:3001' : '';
        const response = await fetch(`${PROXY_URL}/api/execute-python`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: cell.content,
            workingDir: isLocal ? 'local-env' : '/tmp'
          })
        });
        const result = await response.json();
        if (result.success) {
          output = result.output || 'Code executed successfully (no output)';
        } else {
          output = `ERROR:\n${result.error || result.stderr}`;
        }
      } else {
        const previousCode = cells
          .slice(0, cellIndex)
          .filter(c => c.type === 'code')
          .map(c => c.content)
          .join('\n');
        const sysPrompt = `ACT AS A TACTICAL PYTHON KERNEL. 
        CONTEXT (Simulated Memory):
        ${previousCode}
        TASK: Execute the code below.
        RULES:
        1. If the result is a Table/DataFrame, format it as a markdown table.
        2. If you find new variables, list them at the END of your response in this JSON format:
           [DATA_VARS]: [{"name": "var_name", "type": "str/int/df", "value": "preview"}]
        3. OUTPUT ONLY THE EXECUTION RESULT. No conversational text.
        ENGINE: Llama-4 Maverick Node.`;

        const res = await llmAdapter.chat(cell.content, sysPrompt);
        const text = res?.text || "KERNEL_PANIC: Connection lost.";
        const varMatch = text.match(/\[DATA_VARS\]:\s*(\[.*\])/);
        output = text.replace(/\[DATA_VARS\]:.*$/, '').trim();

        if (varMatch) {
          try {
            const parsedVars = JSON.parse(varMatch[1]);
            setVariables(prev => {
              const newVars = [...prev];
              parsedVars.forEach((v: any) => {
                const idx = newVars.findIndex(existing => existing.name === v.name);
                if (idx >= 0) newVars[idx] = v;
                else newVars.push(v);
              });
              return newVars;
            });
          } catch (e) {
            console.error('Failed to parse variables:', e);
          }
        }
      }
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
        newCells[cellIndex].output = "KERNEL_PANIC: Simulation Node Offline.";
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

  const clearNotebook = () => {
    if (window.confirm("WIPE_RAM: Are you sure you want to clear all mission data?")) {
      setCells([]);
      setVariables([]);
      db.saveNotebook([]);
    }
  };

  const handleDbDataLoaded = (data: any[], query: string) => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type: 'code',
      content: `# SQL CONNECTION ESTABLISHED\n# Query: ${query}\n# Fetched ${data.length} rows.\n\n# Data loaded into 'df' variable\ndata = ${JSON.stringify(data.slice(0, 500))} # Limited to 500 rows for BrowserSafe Mode\nimport pandas as pd\ndf = pd.DataFrame(data)\nprint(f"Loaded DataFrame: {df.shape}")\nprint(df.head())`,
      output: `DATABASE LINK ESTABLISHED. ${data.length} records transferred to secure memory.`
    };
    setCells(prev => [...prev, newCell]);
  };

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    { role: 'model', content: "COMMANDER. I am ATLAS_ADVISOR. I can explain your code, analyze data patterns, or suggest mission-critical logic improvements. How shall we proceed?" }
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  const askAssistant = async () => {
    if (!assistantInput.trim()) return;
    const userMsg = assistantInput;
    setAssistantInput('');
    setAssistantMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAssistantThinking(true);

    try {
      const notebookContext = cells.map(c => `[${c.type.toUpperCase()}]: ${c.content}\n[OUTPUT]: ${c.output || 'None'}`).join('\n---\n');
      const sysPrompt = `ACT AS ATLAS SCIENTIFIC ADVISOR. 
      CURRENT NOTEBOOK STATE:
      ${notebookContext}
      TASK: Answer the Commander about "What is happening" in this lab or "How everything was done". Keep it technical yet tactical. Use Roman Urdu/English mix where appropriate.`;

      const res = await llmAdapter.chat(userMsg, sysPrompt);
      setAssistantMessages(prev => [...prev, { role: 'model', content: res?.text || "Communication nodes jammed." }]);
    } catch (e) {
      setAssistantMessages(prev => [...prev, { role: 'model', content: "Neural link offline." }]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050508] text-gray-300 font-mono text-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#76b900 1px, transparent 1px), linear-gradient(90deg, #76b900 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      {/* TOP HEADER / TOOLBAR */}
      <div className="flex-none p-4 md:h-14 border-b border-white/5 flex flex-col md:flex-row md:items-center px-4 md:px-6 gap-4 bg-black/60 backdrop-blur-xl relative z-20 overflow-x-auto">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#76b900] shadow-[0_0_15px_#76b900] animate-pulse"></div>
            <span className="text-xs font-black orbitron text-white uppercase tracking-[0.2em]">Quantum_Data_v3</span>
          </div>
          <div className="flex gap-2 md:hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-all ${isSidebarOpen ? 'bg-[#76b900]/20 text-[#76b900]' : 'bg-white/5 text-gray-600'}`}
            >
              <i className="fa-solid fa-table-list"></i>
            </button>
          </div>
        </div>
        <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-2"></div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button onClick={() => addCell('code')} className="whitespace-nowrap px-3 md:px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-[#76b900]/20 hover:text-[#76b900] transition-all text-[9px] md:text-[10px] orbitron font-bold uppercase"><i className="fa-solid fa-code mr-2 text-[#76b900]"></i>+ Code</button>
          <button onClick={() => addCell('markdown')} className="whitespace-nowrap px-3 md:px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[9px] md:text-[10px] orbitron font-bold uppercase"><i className="fa-solid fa-file-lines mr-2"></i>+ Mark</button>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto justify-end">
          <button onClick={clearNotebook} className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500/60 hover:bg-red-500/10 transition-all text-[8px] orbitron font-bold uppercase"><i className="fa-solid fa-eraser mr-1"></i> Wipe</button>
          <label className="whitespace-nowrap px-3 md:px-4 py-1.5 rounded-lg bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/30 hover:bg-[#76b900]/20 cursor-pointer transition-all text-[9px] md:text-[10px] orbitron font-bold uppercase flex items-center gap-2">
            <i className="fa-solid fa-file-csv"></i> Ingest
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          </label>
          <button onClick={() => setIsDbModalOpen(true)} className="whitespace-nowrap px-3 md:px-4 py-1.5 rounded-lg bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/30 hover:bg-[#76b900]/20 transition-all text-[9px] md:text-[10px] orbitron font-bold uppercase flex items-center gap-2">
            <i className="fa-solid fa-database"></i> SQL Connect
          </button>
          <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-2"></div>
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={`p-2 px-4 rounded-lg transition-all flex items-center gap-2 orbitron font-black text-[10px] uppercase ${isAssistantOpen ? 'bg-[#76b900] text-black shadow-[0_0_20px_rgba(118,185,0,0.4)]' : 'bg-white/5 text-gray-500 hover:text-[#76b900]'}`}
          >
            <i className="fa-solid fa-microchip"></i>
            <span className="hidden lg:inline">Advisor</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden md:block p-2 rounded-lg transition-all ${isSidebarOpen ? 'bg-[#76b900]/20 text-[#76b900]' : 'bg-white/5 text-gray-600'}`}
            title="Variable Inspector"
          >
            <i className="fa-solid fa-table-list"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* CELLS MAIN AREA */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 space-y-6 md:space-y-10 relative z-10 touch-pan-y">
            <div className="max-w-5xl mx-auto pb-40">
              {cells.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center opacity-[0.05] text-center grayscale">
                  <i className="fa-solid fa-dna text-[120px] mb-8 text-white"></i>
                  <h3 className="orbitron font-black text-xl tracking-[0.6em] uppercase">Laboratory Empty</h3>
                  <p className="mt-4 text-xs tracking-widest uppercase">Inject code or text to begin analysis.</p>
                </div>
              )}
              {cells.map((cell, index) => (
                <div key={cell.id}
                  className={`group relative rounded-[32px] overflow-hidden transition-all duration-500 ${activeCell === cell.id ? 'bg-white/[0.03] border border-white/10 shadow-2xl scale-[1.01]' : 'border border-transparent'}`}
                >
                  <div className="absolute left-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {cell.type === 'code' && (
                      <button
                        onClick={() => executeCell(cell.id)}
                        disabled={cell.isExecuting}
                        className="w-10 h-10 rounded-2xl bg-[#0a0a0f] border border-white/5 hover:border-[#76b900] text-[#76b900] flex items-center justify-center transition-all hover:scale-110 shadow-xl"
                      >
                        {cell.isExecuting ? <i className="fa-solid fa-atom fa-spin text-xs"></i> : <i className="fa-solid fa-play text-xs"></i>}
                      </button>
                    )}
                    <button onClick={() => deleteCell(cell.id)} className="w-10 h-10 rounded-2xl bg-[#0a0a0f] border border-white/5 hover:border-red-500 text-red-500 flex items-center justify-center transition-all hover:scale-110">
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>

                  <div className={`p-6 pl-20 ${cell.type === 'markdown' ? 'bg-[#0a0a0f]/40' : 'bg-[#0a0a0f]'}`} onClick={() => setActiveCell(cell.id)}>
                    <div className="flex items-center gap-3 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className={`text-[8px] orbitron font-black px-3 py-1 rounded-full border ${cell.type === 'code' ? 'border-[#76b900] text-[#76b900]' : 'border-gray-500 text-gray-500'}`}>
                        {cell.type === 'code' ? `UNIT_NODE_0${index + 1}` : `LOG_NODE_0${index + 1}`}
                      </span>
                      {cell.type === 'code' && <div className="h-[1px] flex-1 bg-gradient-to-r from-[#76b900]/20 to-transparent"></div>}
                    </div>
                    <textarea
                      value={cell.content}
                      onChange={(e) => updateCellContent(cell.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                          e.preventDefault();
                          executeCell(cell.id);
                        }
                      }}
                      className={`w-full bg-transparent outline-none resize-none min-h-[50px] transition-all duration-300 selection:bg-[#76b900] selection:text-black ${cell.type === 'markdown' ? 'text-gray-300 font-sans text-xl font-light italic' : 'text-white/80 font-mono text-sm leading-relaxed'}`}
                      spellCheck={false}
                      onInput={(e: any) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = (e.target.scrollHeight + 10) + 'px';
                      }}
                      placeholder={cell.type === 'code' ? 'print("System Online") # Shift + Enter' : '# Entry Title...'}
                    />
                  </div>

                  {cell.output && (
                    <div className="bg-black/60 border-t border-white/5 p-8 relative overflow-hidden animate-in fade-in duration-500">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <i className="fa-solid fa-microchip text-8xl text-[#76b900]"></i>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] animate-pulse"></div>
                        <span className="text-[9px] orbitron font-black text-white/20 tracking-widest uppercase">Telemetry Stream 0{index + 1}</span>
                      </div>
                      <div className="overflow-x-auto custom-scrollbar">
                        <pre className={`text-xs whitespace-pre-wrap font-mono leading-relaxed bg-[#76b900]/[0.02] p-6 rounded-2xl border border-[#76b900]/10 text-[#76b900]/90 selection:bg-[#76b900] selection:text-black shadow-inner`}>
                          {cell.output}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="relative group mt-12">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#76b900]/20 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <button
                  onClick={() => addCell('code')}
                  className="w-full py-20 flex flex-col items-center justify-center rounded-[3rem] border border-white/5 bg-[#0a0a0b]/40 hover:bg-[#76b900]/5 hover:border-[#76b900]/30 transition-all relative overflow-hidden group shadow-2xl"
                >
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700 group-hover:text-[#76b900] group-hover:scale-110 transition-all duration-[1s] border border-white/10 group-hover:border-[#76b900]/40 shadow-inner">
                    <i className="fa-solid fa-microchip text-3xl"></i>
                  </div>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <span className="text-[10px] orbitron font-black text-gray-500 group-hover:text-white uppercase tracking-[0.6em] transition-colors italic">Inject_Quantum_Node</span>
                    <div className="flex gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                      <div className="w-1 h-1 rounded-full bg-[#76b900]"></div>
                      <div className="w-1 h-1 rounded-full bg-[#76b900]"></div>
                      <div className="w-1 h-1 rounded-full bg-[#76b900]"></div>
                    </div>
                  </div>

                  {/* Tactical Borders */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/10 group-hover:border-[#76b900]/40 transition-colors"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/10 group-hover:border-[#76b900]/40 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/10 group-hover:border-[#76b900]/40 transition-colors"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/10 group-hover:border-[#76b900]/40 transition-colors"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: VARIABLE INSPECTOR (RAM VIEW) */}
        {isSidebarOpen && (
          <div className="absolute inset-y-0 right-0 z-30 md:static md:z-20 w-80 bg-[#0a0a0f] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl md:shadow-none">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex flex-col">
                <h3 className="text-[10px] orbitron font-black text-white uppercase tracking-widest leading-none">Memory_Node</h3>
                <span className="text-[7px] text-[#76b900] font-black uppercase tracking-[0.2em] mt-1">Status: Operational</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#76b900] shadow-[0_0_8px_#76b900]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[8px] font-black text-[#76b900] orbitron uppercase tracking-widest">Variable_Matrix</span>
                  <span className="text-[7px] text-gray-600 uppercase font-mono tracking-widest">RAM_SYNC</span>
                </div>
                {variables.length > 0 ? (
                  <div className="space-y-3">
                    {variables.map((v, i) => (
                      <div key={i} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-[#76b900]/30 transition-all cursor-crosshair group/var hover:bg-white/[0.05]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-white truncate max-w-[120px] orbitron tracking-widest uppercase">{v.name}</span>
                          <span className="text-[7px] orbitron text-[#76b900] bg-[#76b900]/10 px-2 py-0.5 rounded-lg font-black border border-[#76b900]/20">{v.type}</span>
                        </div>
                        <div className="text-[9px] text-white/30 truncate font-mono mt-2 group-hover/var:text-white/60 italic transition-colors">
                          {v.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-[0.1] grayscale">
                    <i className="fa-solid fa-atom text-5xl mb-6 text-white animate-spin-slow"></i>
                    <p className="text-[8px] orbitron font-black uppercase tracking-widest">No Active Memory Residue</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LAB ASSISTANT OVERLAY */}
        {isAssistantOpen && (
          <div className="w-96 bg-[#0a0a0f] border-l border-white/5 flex flex-col relative z-30 shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#76b900]/5">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-brain text-[#76b900]"></i>
                <h3 className="text-[10px] orbitron font-black text-white uppercase tracking-widest">Neural_Advisor_B1</h3>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {assistantMessages.map((msg, i) => (
                <div key={i} className={`p-6 rounded-[30px] text-[11px] leading-relaxed relative ${msg.role === 'user' ? 'bg-white/5 ml-8 border border-white/10 text-white/70' : 'bg-[#76b900]/5 mr-8 border border-[#76b900]/10 text-white'}`}>
                  <div className={`text-[7px] orbitron font-black mb-2 uppercase tracking-widest ${msg.role === 'user' ? 'text-white/20' : 'text-[#76b900]/60'}`}>
                    {msg.role === 'user' ? 'Commander_Feed' : 'Neural_Response'}
                  </div>
                  {msg.content}
                </div>
              ))}
              {isAssistantThinking && (
                <div className="flex items-center gap-3 pl-4 text-[8px] text-[#76b900] animate-pulse orbitron tracking-[0.2em] font-black uppercase">
                  <i className="fa-solid fa-atom fa-spin"></i> Analyzing_Logic_Matrix...
                </div>
              )}
            </div>
            <div className="p-6 bg-black/80 border-t border-white/5 backdrop-blur-3xl">
              <div className="flex gap-2">
                <input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAssistant()}
                  placeholder="Logic query..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs outline-none focus:border-[#76b900] transition-all font-mono text-white placeholder:text-white/10"
                />
                <button
                  onClick={askAssistant}
                  className="w-14 h-14 rounded-2xl bg-[#76b900] text-black flex items-center justify-center hover:bg-white transition-all shadow-[0_15px_30px_rgba(118,185,0,0.3)] hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-bolt text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <DatabaseModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} onDataLoaded={handleDbDataLoaded} />
    </div>
  );
};

export default NotebookView;
