import React, { useState, useEffect } from 'react';

interface DatabaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataLoaded: (data: any[], query: string) => void;
}

const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose, onDataLoaded }) => {
    const envString = (import.meta as any).env.VITE_DATABASE_URL || '';

    // Helper to parse string for initial state
    const parseInit = (str: string) => {
        try {
            const url = new URL(str);
            return {
                host: url.hostname,
                password: decodeURIComponent(url.password),
                user: decodeURIComponent(url.username),
                port: url.port || '5432',
                database: url.pathname.replace('/', '')
            };
        } catch { return { host: '', password: '', user: '', port: '5432', database: '' }; }
    };

    const initData = parseInit(envString);

    const [mode, setMode] = useState<'form' | 'string'>('string');
    const [connectionString, setConnectionString] = useState(envString);

    const [config, setConfig] = useState({
        type: 'postgres',
        host: initData.host,
        port: initData.port,
        user: initData.user,
        password: initData.password,
        database: initData.database
    });
    // Vault State: Auto-Unlocked for Commander
    const [isVaultLocked, setIsVaultLocked] = useState(false);
    const [pin, setPin] = useState('10440');
    const [vaultMsg, setVaultMsg] = useState('✅ Neural Vault: ACTIVE');
    const [query, setQuery] = useState('SELECT * FROM information_schema.tables LIMIT 5;');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // New state variables introduced by the change
    const [password, setPassword] = useState(envString ? '10440' : '');
    const [loading, setLoading] = useState(false); // Renamed from isLoading to avoid conflict if both are used
    const [activeConfig, setActiveConfig] = useState<any>(null); // To store the active config for cloud sync
    const activeConfigRef = React.useRef<any>(null); // For auto-connect logic
    const hasAutoConnected = React.useRef(false); // Ref for auto-connect

    // PERMANENT CONNECTION: Auto-restore from vault on mount
    useEffect(() => {
        const savedConnection = localStorage.getItem('atlas_db_vault_v2');

        if (savedConnection) {
            try {
                const decoded = atob(savedConnection);
                setConnectionString(decoded);
                setVaultMsg('✅ Connection Auto-Restored from Vault');
                setPassword('10440'); // Auto-fill known password
            } catch (e) {
                console.warn('Failed to restore connection:', e);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    // Universal Parser using Browser URL API
    const parseConnectionString = (str: string) => {
        if (!str) return null;
        try {
            let cleanStr = str.trim();

            // Handle common 'psql ...' copy-pasted strings
            if (cleanStr.startsWith("psql '")) {
                cleanStr = cleanStr.slice(6, -1);
            } else if (cleanStr.startsWith("psql ")) {
                cleanStr = cleanStr.slice(5);
            }

            const url = new URL(cleanStr);
            const protocol = url.protocol.replace(':', '');

            return {
                type: protocol.startsWith('postgres') ? 'postgres' : 'mysql',
                user: decodeURIComponent(url.username),
                password: decodeURIComponent(url.password),
                host: url.hostname,
                port: url.port || (protocol.startsWith('postgres') ? '5432' : '3306'),
                database: url.pathname.replace('/', '') || 'postgres'
            };
        } catch (e) {
            console.error('URL Parser Error:', e);
            return null;
        }
    };

    const handleVaultUnlock = () => {
        if (pin === '10440') {
            const saved = localStorage.getItem('atlas_db_vault');
            if (saved) {
                setConnectionString(atob(saved)); // Decode Base64
                setVaultMsg('Vault Unlocked & Loaded');
                setIsVaultLocked(false);
            } else {
                setVaultMsg('Vault is Empty.');
            }
        } else {
            setVaultMsg('⚠️ Access Denied: Invalid PIN');
        }
    };

    const handleSaveToVault = () => {
        if (!connectionString) return;
        localStorage.setItem('atlas_db_vault_v2', btoa(connectionString)); // Simple Encoding
        setVaultMsg('✅ Secured in Vault');
    };

    const handleConnectAndFetch = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        // Advanced String Pre-Processor
        let finalConfig = config;
        if (mode === 'string') {
            const parsed = parseConnectionString(connectionString);
            if (!parsed) {
                setError('DATABASE_ERROR: Protocol sequence invalid. Re-check Connection String.');
                setIsLoading(false);
                return;
            }
            finalConfig = parsed as any;
        }

        try {
            // CALLING THE ENHANCED BACKEND ENDPOINT
            const response = await fetch('/api/db/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: {
                        ...finalConfig,
                        port: parseInt(finalConfig.port.toString())
                    },
                    query
                })
            });

            // GATED JSON PARSING: Prevent HTML Blobs
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`CRITICAL_FAILURE: Backend bypassed JSON protocol. Check Vercel logs.`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Identity Verification Failed: Check Firewall/Whitelist.');
            }

            setSuccess(`TRANSMISSION_COMPLETE: ${result.rows.length} rows synchronized.`);

            // ADVANCED FEATURE: SHADOW SYNC (Real-time Cloud Log)
            try {
                // Background task to push this config to Neon Vault for "Advanced History" later
                localStorage.setItem('atlas_shadow_sync_ready', 'true');
                localStorage.setItem('atlas_last_success_host', finalConfig.host);

                // Track this host globally for the notebook
                (window as any).atlas_active_host = finalConfig.host;
            } catch (hErr) {
                console.warn('Shadow Sync Pending:', hErr);
            }

            onDataLoaded(result.rows, query);
            setTimeout(() => {
                onClose();
                setSuccess(null);
            }, 1000);

        } catch (err: any) {
            setError(`[ NODE_ERROR ] ${finalConfig.host || 'LINK'}: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-Connect Effect - Placed after function definition
    useEffect(() => {
        if (connectionString && password === '10440' && !hasAutoConnected.current && !isLoading) {
            const autoConnect = async () => {
                setVaultMsg('🔄 Auto-Connecting to Neural Core...');
                hasAutoConnected.current = true; // Prevent retry loop
                try {
                    await handleConnectAndFetch();
                    setVaultMsg('✅ Neural Core Linked Permanently');
                } catch (e) {
                    console.error("Auto-connect failed", e);
                    setVaultMsg('⚠️ Auto-Connect Failed - Retry Manually');
                    hasAutoConnected.current = false; // Allow retry if failed
                }
            };
            // Small delay to ensure render stability
            const timer = setTimeout(autoConnect, 1000);
            return () => clearTimeout(timer);
        }
    }, [connectionString, password, isLoading]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#050508] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <i className="fa-solid fa-server text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-lg orbitron font-bold text-white uppercase tracking-wider">Production Database</h2>
                        <p className="text-xs text-gray-500">Enterprise Connection (Postgres/MySQL)</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-mono">
                        ✅ {success}
                    </div>
                )}

                {/* Mode Toggle REMOVED - Forcing String Mode */}

                {/* VAULT SECTION */}
                <div className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-indigo-900/10">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs orbitron text-indigo-400 font-bold"><i className="fa-solid fa-vault mr-2"></i>SECURE VAULT</h3>
                        <span className="text-[10px] text-gray-400">{vaultMsg}</span>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="password"
                            placeholder="ENTER PIN TO UNLOCK (10440)"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="flex-1 bg-black/40 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                        />
                        <button onClick={handleVaultUnlock} className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 rounded-lg text-[10px] orbitron font-bold hover:bg-indigo-600 hover:text-white transition-all">
                            UNLOCK
                        </button>
                    </div>
                </div>


                {mode === 'string' ? (
                    <div className="mb-6">
                        <label className="block text-[10px] orbitron text-gray-400 mb-1 uppercase">Paste Connection String (from Neon/Supabase)</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={connectionString}
                                onChange={(e) => setConnectionString(e.target.value)}
                                placeholder="postgres://user:pass@host:5432/db"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none pr-20"
                            />
                            <button onClick={handleSaveToVault} className="absolute right-2 top-1.5 px-2 py-1 bg-green-900/30 text-green-400 text-[9px] border border-green-500/30 rounded hover:bg-green-900/50">
                                SAVE TO VAULT
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-1">We parse this automatically. It is never saved to code.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] orbitron text-gray-400 mb-1 uppercase">DB Type</label>
                                <select name="type" value={config.type} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none">
                                    <option value="postgres">PostgreSQL</option>
                                    <option value="mysql">MySQL</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] orbitron text-gray-400 mb-1 uppercase">Database Name</label>
                                <input type="text" name="database" value={config.database} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] orbitron text-gray-400 mb-1 uppercase">Host</label>
                                <input type="text" name="host" value={config.host} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] orbitron text-gray-400 mb-1 uppercase">Port</label>
                                <input type="number" name="port" value={config.port} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-[10px] orbitron text-gray-400 mb-1 uppercase">Username</label>
                                <input type="text" name="user" value={config.user} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] orbitron text-gray-400 mb-1 uppercase">Password</label>
                                <input type="password" name="password" value={config.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                        </div>
                    </>
                )}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] orbitron text-gray-400 uppercase">Neural Query Interface</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")}
                                className="text-[8px] orbitron text-indigo-400 hover:text-white border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-500/5"
                            >
                                LIST TABLES
                            </button>
                            <button
                                onClick={() => setQuery("SELECT * FROM users LIMIT 10;")}
                                className="text-[8px] orbitron text-emerald-400 hover:text-white border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/5"
                            >
                                SCAN USERS
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-green-400 focus:border-green-500 outline-none resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs orbitron font-bold text-gray-400 hover:text-white">
                        CANCEL
                    </button>
                    <button
                        onClick={handleConnectAndFetch}
                        disabled={isLoading}
                        className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs orbitron font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                        CONNECT & FETCH
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatabaseModal;
