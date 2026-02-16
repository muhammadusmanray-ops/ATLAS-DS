
// Vercel Serverless Function Wrapper for Kaggle API Proxy
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { queryDatabase } from './db-connector.js';
import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load env variables
dotenv.config();

const app = express();

// --- MIDDLEWARE ---
// Ensure body parsing and CORS are set up BEFORE any routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Monitor Requests
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const resend = new Resend('re_UnpPXcWV_Q4ynAyLZc2u6FBNHmtzhEANy');
const KAGGLE_USERNAME = process.env.KAGGLE_USERNAME;
const KAGGLE_API_KEY = process.env.KAGGLE_API_KEY;

// --- AUTHENTICATION & USERS (NEON PERSISTENCE) ---

// Helper to validate DB config
const validateConfig = (config) => {
    // 🛡️ SECURITY FALLBACK: Try multiple environment variable names
    const envUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!config && envUrl) {
        try {
            const matches = envUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
            if (matches) {
                return {
                    type: 'postgres',
                    user: matches[1],
                    password: matches[2],
                    host: matches[3],
                    port: matches[4] || '5432',
                    database: matches[5]
                };
            }
        } catch (e) {
            console.error("Critical: Database URL Parsing Failed:", e.message);
        }
    }

    if (!config) {
        const errorMsg = envUrl
            ? "DATABASE_INIT_FAILED: Config missing and ENV_URL parsing failed."
            : "DATABASE_NOT_CONFIGURED: No connection parameters or Vercel Secrets found.";
        throw new Error(errorMsg);
    }
    return config;
};

// Setup Users Table
app.post('/api/auth/init', async (req, res) => {
    try {
        const { config } = req.body || {};
        const dbConfig = validateConfig(config);
        const createTable = `
            CREATE TABLE IF NOT EXISTS atlas_users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                avatar TEXT,
                rank TEXT DEFAULT 'Lead Scientist',
                verified BOOLEAN DEFAULT FALSE,
                verification_code TEXT
            );
        `;
        await queryDatabase(dbConfig, createTable);
        res.json({ success: true, message: 'Identity Vault Initialized' });
    } catch (error) {
        console.error('❌ Auth Init Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { config, id, name, email, password, avatar } = req.body || {};
        const dbConfig = validateConfig(config);

        // Auto-init for fallback (including verification fields)
        await queryDatabase(dbConfig, `
            CREATE TABLE IF NOT EXISTS atlas_users (
                id TEXT PRIMARY KEY, 
                name TEXT, 
                email TEXT UNIQUE, 
                password TEXT, 
                avatar TEXT, 
                rank TEXT DEFAULT 'Lead Scientist',
                verified BOOLEAN DEFAULT FALSE,
                verification_code TEXT
            );
        `);

        // HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // GENERATE OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const query = {
            text: 'INSERT INTO atlas_users (id, name, email, password, avatar, verification_code) VALUES ($1, $2, $3, $4, $5, $6)',
            values: [id, name, email, hashedPassword, avatar, otp]
        };
        await queryDatabase(dbConfig, query);

        // DISPATCH OTP EMAIL
        try {
            await resend.emails.send({
                from: 'Atlas Intelligence <onboarding@resend.dev>',
                to: email,
                subject: '🔐 ATLAS-X: Verification Protocol',
                html: `
                    <div style="font-family: monospace; background: #050505; color: #fff; padding: 40px; border: 1px solid #00f3ff;">
                        <h1 style="color: #00f3ff;">IDENTITY_HANDSHAKE</h1>
                        <p>Commander ${name},</p>
                        <p>Your tactical access code is:</p>
                        <div style="background: #111; padding: 20px; font-size: 32px; letter-spacing: 10px; text-align: center; border: 1px dashed #00f3ff; color: #00f3ff;">
                            ${otp}
                        </div>
                        <p style="font-size: 10px; color: #555; margin-top: 40px;">SECURE GATEWAY v6.0 | ENCRYPTED PACKET</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Email Dispatch Failed:', emailErr.message);
        }

        console.log(`✅ [REGISTER] Secure account created: ${email}. OTP: ${otp}`);
        res.json({ success: true, needsVerification: true });
    } catch (error) {
        console.error('❌ Registration Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { config, email, password } = req.body || {};
        const dbConfig = validateConfig(config);

        // Auto-init for fallback
        await queryDatabase(dbConfig, `CREATE TABLE IF NOT EXISTS atlas_users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, avatar TEXT, rank TEXT DEFAULT 'Lead Scientist');`);

        const query = {
            text: 'SELECT * FROM atlas_users WHERE email = $1',
            values: [email]
        };
        const rows = await queryDatabase(dbConfig, query);

        if (rows && rows.length > 0) {
            const user = rows[0];

            if (!user.verified) {
                return res.status(403).json({ success: false, error: 'IDENTITY_PENDING: Please verify your email first.', needsVerification: true });
            }

            // COMPARE Hash
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                console.log(`✅ [LOGIN] Authenticated: ${email}`);
                // Remove password from response for security
                const { password: _, verification_code: __, ...userWithoutPassword } = user;
                res.json({ success: true, user: userWithoutPassword });
            } else {
                res.status(401).json({ success: false, error: 'Invalid Credentials' });
            }
        } else {
            console.warn(`⚠️ [LOGIN] Access Denied: ${email}`);
            res.status(401).json({ success: false, error: 'Invalid Credentials' });
        }
    } catch (error) {
        console.error('❌ Login Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const { config, email, code } = req.body || {};
        const dbConfig = validateConfig(config);

        const query = {
            text: 'SELECT * FROM atlas_users WHERE email = $1 AND verification_code = $2',
            values: [email, code]
        };
        const rows = await queryDatabase(dbConfig, query);

        if (rows && rows.length > 0) {
            await queryDatabase(dbConfig, {
                text: 'UPDATE atlas_users SET verified = TRUE, verification_code = NULL WHERE email = $1',
                values: [email]
            });
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(400).json({ success: false, error: 'INVALID_CODE: Verification mismatch.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Atlas Backend is ALIVE' });
});

app.get('/api/competitions', async (req, res) => {
    try {
        console.log('📡 Fetching competitions from Kaggle API...');
        const response = await axios.get('https://www.kaggle.com/api/v1/competitions/list', {
            auth: { username: KAGGLE_USERNAME, password: KAGGLE_API_KEY },
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000
        });

        const competitions = response.data.map(comp => ({
            id: comp.url,
            title: comp.title,
            description: comp.description || 'Machine learning competition',
            deadline: comp.deadline,
            category: comp.category,
            reward: comp.reward || 'Knowledge',
            teamCount: comp.teamCount || 0,
            userHasEntered: comp.userHasEntered || false,
            url: `https://www.kaggle.com/c/${comp.url}`,
            evaluationMetric: comp.evaluationMetric || 'Accuracy',
            maxTeamSize: comp.maxTeamSize || 1,
            enabledDate: comp.enabledDate,
        }));

        res.json(competitions);
    } catch (error) {
        console.error('❌ Kaggle Error:', error.message);
        // Return empty array instead of 500 so frontend uses Fallback data
        res.json([]);
    }
});

app.get('/api/competitions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://www.kaggle.com/api/v1/competitions/${id}`, {
            auth: { username: KAGGLE_USERNAME, password: KAGGLE_API_KEY },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch details', message: error.message });
    }
});

app.get('/api/competitions/:id/leaderboard', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://www.kaggle.com/api/v1/competitions/${id}/leaderboard`, {
            auth: { username: KAGGLE_USERNAME, password: KAGGLE_API_KEY },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard', message: error.message });
    }
});

app.get('/api/datasets', async (req, res) => {
    try {
        const { search } = req.query;
        const url = search
            ? `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(search)}`
            : 'https://www.kaggle.com/api/v1/datasets/list';

        const response = await axios.get(url, {
            auth: { username: KAGGLE_USERNAME, password: KAGGLE_API_KEY },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch datasets', message: error.message });
    }
});

// Database Query Endpoint
app.post('/api/db/query', async (req, res) => {
    try {
        const { config, query } = req.body || {};
        const dbConfig = validateConfig(config);
        const results = await queryDatabase(dbConfig, query);
        res.json({ success: true, rows: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Python Execution Endpoint
app.post('/api/execute-python', async (req, res) => {
    try {
        const { code, workingDir } = req.body || {};
        if (!code) return res.status(400).json({ error: 'No code provided' });

        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execPromise = promisify(exec);
        const fs = await import('fs');
        const path = await import('path');
        const os = await import('os');

        const tempDir = workingDir || os.tmpdir();
        const tempFile = path.join(tempDir, `atlas_exec_${Date.now()}.py`);
        fs.writeFileSync(tempFile, code);

        const { stdout, stderr } = await execPromise(`python "${tempFile}"`, {
            timeout: 30000,
            maxBuffer: 1024 * 1024 * 10,
            cwd: tempDir
        });

        try { fs.unlinkSync(tempFile); } catch (e) { }

        res.json({ success: true, output: stdout || stderr, error: stderr && !stdout ? stderr : null });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- CLOUD HISTORY PERSISTENCE ---

app.post('/api/history/init', async (req, res) => {
    try {
        const { config } = req.body || {};
        const dbConfig = validateConfig(config);

        const createSessionsTable = `
            CREATE TABLE IF NOT EXISTS atlas_sessions (
                id TEXT PRIMARY KEY,
                module_id TEXT,
                title TEXT,
                last_updated TIMESTAMP DEFAULT NOW(),
                preview TEXT
            );
        `;
        const createChatsTable = `
            CREATE TABLE IF NOT EXISTS atlas_chats (
                session_id TEXT PRIMARY KEY,
                messages JSONB
            );
        `;
        await queryDatabase(dbConfig, createSessionsTable);
        await queryDatabase(dbConfig, createChatsTable);
        res.json({ success: true, message: 'Cloud Vault Initialized' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/history/save', async (req, res) => {
    try {
        const { config, sessionId, moduleId, title, messages, preview } = req.body || {};
        const dbConfig = validateConfig(config);

        const upsertSession = {
            text: `INSERT INTO atlas_sessions (id, module_id, title, preview, last_updated)
                   VALUES ($1, $2, $3, $4, NOW())
                   ON CONFLICT (id) DO UPDATE 
                   SET last_updated = NOW(), preview = EXCLUDED.preview;`,
            values: [sessionId, moduleId, title, preview]
        };
        const upsertChat = {
            text: `INSERT INTO atlas_chats (session_id, messages)
                   VALUES ($1, $2)
                   ON CONFLICT (session_id) DO UPDATE 
                   SET messages = EXCLUDED.messages;`,
            values: [sessionId, JSON.stringify(messages)]
        };
        await queryDatabase(dbConfig, upsertSession);
        await queryDatabase(dbConfig, upsertChat);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/history/load-sessions', async (req, res) => {
    try {
        const { config, moduleId } = req.body || {};
        const dbConfig = validateConfig(config);
        const query = {
            text: 'SELECT * FROM atlas_sessions WHERE module_id = $1 ORDER BY last_updated DESC',
            values: [moduleId]
        };
        const rows = await queryDatabase(dbConfig, query);
        res.json(rows);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/history/load-chat', async (req, res) => {
    try {
        const { config, sessionId } = req.body || {};
        const dbConfig = validateConfig(config);
        const query = {
            text: 'SELECT messages FROM atlas_chats WHERE session_id = $1',
            values: [sessionId]
        };
        const rows = await queryDatabase(dbConfig, query);
        res.json(rows[0]?.messages || []);
    } catch (error) {
        res.json([]);
    }
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`📡 [SYSTEM] Atlas Backend ALIVE on http://localhost:${PORT}`);
    });
}

export default app;
