import express from 'express';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetch } from 'undici';

dotenv.config();

const { Pool } = pg;
const app = express();

app.use(express.json());
app.use(cors());

// --- Database Connection (Neon Postgres Only) ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const JWT_SECRET = process.env.JWT_SECRET || 'atlas_secret_2026';

// --- Simple Auth Routes (Back to Postgres) ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (email, password_hash, verified) VALUES ($1, $2, TRUE)',
            [email.toLowerCase().trim(), hash]
        );
        res.json({ success: true, message: "User created" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ user: { id: user.id, email: user.email }, token });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// --- Database Query Route (Fixing Route Mismatch & JSON Errors) ---
app.post('/api/db/query', async (req, res) => {
    try {
        const { config, query } = req.body;

        // If config is provided, we use a temporary pool for that specific DB
        if (config && config.host) {
            const tempPool = new Pool({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database,
                ssl: { rejectUnauthorized: false }
            });

            const result = await tempPool.query(query);
            await tempPool.end(); // Close connection after query
            return res.json({ success: true, rows: result.rows });
        }

        // Fallback to internal pool if no config
        const result = await pool.query(query);
        res.json({ success: true, rows: result.rows });
    } catch (err) {
        console.error("DB_QUERY_ERROR:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Alias for old /api/query route if needed
app.post('/api/query', async (req, res) => {
    try {
        const { sql } = req.body;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 ATLAS CORE ACTIVE ON PORT ${PORT}`);
});

export default app;
