import express from 'express';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetch } from 'undici';
import { queryDatabase } from './db-connector.js';

// Load env variables
dotenv.config();

const { Pool } = pg;
const app = express();

app.use(express.json());
app.use(cors());

// --- Database Connection ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// --- Database Initialization ---
const initDB = async () => {
    try {
        console.log("🛠️ [DB] Synchronizing Global Schema...");

        // 1. Create Tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                otp TEXT,
                verified BOOLEAN DEFAULT FALSE,
                provider TEXT DEFAULT 'local',
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS chats (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                chat_id INTEGER REFERENCES chats(id),
                role TEXT,
                content TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Patch Existing Tables (Safety Check for already existing tables)
        const checkCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        const columns = checkCols.rows.map(r => r.column_name);

        if (!columns.includes('otp')) await pool.query('ALTER TABLE users ADD COLUMN otp TEXT');
        if (!columns.includes('verified')) await pool.query('ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE');
        if (!columns.includes('provider')) await pool.query('ALTER TABLE users ADD COLUMN provider TEXT DEFAULT \'local\'');

        console.log("✅ [DB] Global Schema Synchronized");
    } catch (err) {
        console.error("❌ [DB] Init Failed:", err.message);
    }
};
initDB();

// --- Brevo Email Helper ---
const sendEmail = async (email, subject, htmlContent) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn("⚠️ [MAIL] BREVO_API_KEY missing. Email will NOT be sent.");
        return;
    }
    try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "ATLAS_INTEL", email: "support@atlas-ds.com" },
                to: [{ email: email }],
                subject: subject,
                htmlContent: htmlContent
            })
        });
        if (!res.ok) {
            const errData = await res.json();
            console.error("❌ [MAIL] Brevo Response Error:", errData);
        } else {
            console.log(`✅ [MAIL] OTP sent to ${email}`);
        }
    } catch (err) {
        console.error("❌ [MAIL] Send Failure:", err.message);
    }
};

// --- Middleware ---
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: Missing Token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- 1. AUTH ROUTES ---

app.post('/api/auth/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        res.json({ exists: result.rows.length > 0 });
    } catch (err) {
        console.error("❌ [AUTH] Check Email Error:", err.message);
        res.status(500).json({ error: 'DB Error' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const safeEmail = email.toLowerCase().trim();
        const hash = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await pool.query(
            'INSERT INTO users (email, password_hash, otp, verified) VALUES ($1, $2, $3, FALSE)',
            [safeEmail, hash, otp]
        );

        await sendEmail(safeEmail, "Your ATLAS verification code", `<h1>Verification Code: ${otp}</h1>`);
        res.json({ success: true, message: "OTP sent" });
    } catch (err) {
        console.error("❌ [AUTH] Register Error:", err.message);
        res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const safeEmail = email.toLowerCase().trim();

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [safeEmail]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.verified) {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            await pool.query('UPDATE users SET otp = $1 WHERE id = $2', [newOtp, user.id]);
            await sendEmail(user.email, "Verify Account", `<h1>New OTP: ${newOtp}</h1>`);
            return res.status(403).json({ error: 'Account not verified. New OTP sent.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ user: { id: user.id, email: user.email }, token });
    } catch (err) {
        console.error("❌ [AUTH] Login Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Token' });
        const gData = await googleRes.json();

        let userRes = await pool.query('SELECT * FROM users WHERE email = $1', [gData.email]);
        let user = userRes.rows[0];

        if (!user) {
            const insert = await pool.query(
                'INSERT INTO users (email, provider, verified) VALUES ($1, $2, TRUE) RETURNING id, email',
                [gData.email, 'google']
            );
            user = insert.rows[0];
        }

        const appToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ user, token: appToken });
    } catch (err) {
        res.status(500).json({ error: 'Google auth failed' });
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        const user = result.rows[0];

        if (!user || user.otp !== code) {
            return res.status(401).json({ error: 'Invalid verification code' });
        }

        await pool.query('UPDATE users SET verified = TRUE, otp = NULL WHERE id = $1', [user.id]);
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ user: { id: user.id, email: user.email }, token });
    } catch (err) {
        console.error("❌ [AUTH] Verify Error:", err.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// --- 2. CHAT HISTORY ROUTES ---

app.get('/api/history', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, updated_at FROM chats WHERE user_id = $1 ORDER BY updated_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/save-chat', authenticate, async (req, res) => {
    try {
        const { chatId, userMessage, aiMessage } = req.body;
        let activeChatId = chatId;

        if (!activeChatId) {
            const title = userMessage.substring(0, 30) + "...";
            const chatRes = await pool.query(
                'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id',
                [req.user.id, title]
            );
            activeChatId = chatRes.rows[0].id;
        }

        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [activeChatId, 'user', userMessage]
        );

        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [activeChatId, 'model', aiMessage]
        );

        await pool.query('UPDATE chats SET updated_at = NOW() WHERE id = $1', [activeChatId]);
        res.json({ success: true, chatId: activeChatId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/history/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
        'SELECT id, role, content as text FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
        [id]
    );
    res.json(result.rows);
});

app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({ id: req.user.id, email: req.user.email });
});

// --- 3. DATABASE QUERY ROUTE (NOTEBOOK) ---
app.post('/api/db/query', async (req, res) => {
    try {
        const { config, query } = req.body;
        const rows = await queryDatabase(config, query);
        res.json({ success: true, rows });
    } catch (err) {
        console.error("❌ [DB_QUERY] Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default app;
