const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Database Connection ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// --- Brevo Email Helper ---
const sendEmail = async (email, subject, htmlContent) => {
    if (!process.env.BREVO_API_KEY) return;
    try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Gemini App", email: "sufyar28@gmail.com" }, // Your sender
                to: [{ email: email }],
                subject: subject,
                htmlContent: htmlContent
            })
        });
    } catch (err) {
        console.error("Brevo Error:", err);
    }
};

// --- Middleware ---
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- 1. AUTH ROUTES ---

// Check Email
app.post('/api/auth/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        res.json({ exists: result.rows.length > 0 });
    } catch (err) { res.status(500).json({ error: 'DB Error' }); }
});

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const safeEmail = email.toLowerCase().trim();
        const hash = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Insert User
        await pool.query(
            'INSERT INTO users (email, password_hash, otp, verified) VALUES ($1, $2, $3, FALSE)',
            [safeEmail, hash, otp]
        );

        // Send OTP
        await sendEmail(safeEmail, "Your OTP Code", `<h1>${otp}</h1>`);

        res.json({ success: true, message: "OTP sent" });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// *** CRITICAL: Login with Unverified User Protection ***
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const safeEmail = email.toLowerCase().trim();

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [safeEmail]);
        const user = result.rows[0];

        // 1. Check Credentials
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2. Check Verification Status
        if (!user.verified) {
            // Generate NEW OTP to prevent stale codes
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

            // Update DB
            await pool.query('UPDATE users SET otp = $1 WHERE id = $2', [newOtp, user.id]);

            // Send Email
            await sendEmail(user.email, "Verify Account", `<h1>Your New OTP: ${newOtp}</h1>`);

            // Return 403 Forbidden to trigger OTP screen on frontend
            return res.status(403).json({ error: 'Account not verified. New OTP sent.' });
        }

        // 3. Issue Token if Verified
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ user: { id: user.id, email: user.email }, token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Google Auth (Simplified)
app.post('/api/auth/google', async (req, res) => {
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
});

// --- 2. CHAT HISTORY ROUTES ---

// GET /api/history
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

// POST /api/save-chat
app.post('/api/save-chat', authenticate, async (req, res) => {
    try {
        const { chatId, userMessage, aiMessage } = req.body;
        let activeChatId = chatId;

        // Create new chat session if needed
        if (!activeChatId) {
            const title = userMessage.substring(0, 30) + "...";
            const chatRes = await pool.query(
                'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id',
                [req.user.id, title]
            );
            activeChatId = chatRes.rows[0].id;
        }

        // Insert User Message
        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [activeChatId, 'user', userMessage]
        );

        // Insert AI Message
        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [activeChatId, 'model', aiMessage]
        );

        // Update Chat Timestamp
        await pool.query('UPDATE chats SET updated_at = NOW() WHERE id = $1', [activeChatId]);

        res.json({ success: true, chatId: activeChatId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Messages for a specific chat
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

module.exports = app;
