// Kaggle API Proxy Server
// Purpose: Bypass CORS restrictions when calling Kaggle API from browser
// Why needed: Browsers block direct API calls to different domains (CORS policy)
// How it works: Frontend → This Server → Kaggle API → This Server → Frontend

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Kaggle API credentials (from environment variables for security)
const KAGGLE_USERNAME = process.env.KAGGLE_USERNAME;
const KAGGLE_API_KEY = process.env.KAGGLE_API_KEY;

// Enable CORS for all routes (allows frontend to call this server)
app.use(cors({
    origin: '*', // In production, specify exact frontend URL
    methods: ['GET', 'POST'],
}));

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Kaggle Proxy Server is running' });
});

// ========================================
// KAGGLE API ENDPOINTS
// ========================================

/**
 * GET /api/competitions
 * Fetches list of all Kaggle competitions
 * Returns: Array of competition objects
 */
app.get('/api/competitions', async (req, res) => {
    try {
        console.log('📡 Fetching competitions from Kaggle API...');

        // Call Kaggle API with authentication
        const response = await axios.get('https://www.kaggle.com/api/v1/competitions/list', {
            auth: {
                username: KAGGLE_USERNAME,
                password: KAGGLE_API_KEY,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log(`✅ Fetched ${response.data.length} competitions`);

        // Transform data to our format
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
        console.error('❌ Error fetching competitions:', error.message);
        res.status(500).json({
            error: 'Failed to fetch competitions',
            message: error.message,
        });
    }
});

/**
 * GET /api/competitions/:id
 * Fetches details of a specific competition
 * Params: id - Competition URL slug
 */
app.get('/api/competitions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📡 Fetching competition details for: ${id}`);

        const response = await axios.get(`https://www.kaggle.com/api/v1/competitions/${id}`, {
            auth: {
                username: KAGGLE_USERNAME,
                password: KAGGLE_API_KEY,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('❌ Error fetching competition details:', error.message);
        res.status(500).json({
            error: 'Failed to fetch competition details',
            message: error.message,
        });
    }
});

/**
 * GET /api/competitions/:id/leaderboard
 * Fetches leaderboard for a specific competition
 * Params: id - Competition URL slug
 */
app.get('/api/competitions/:id/leaderboard', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📡 Fetching leaderboard for: ${id}`);

        const response = await axios.get(`https://www.kaggle.com/api/v1/competitions/${id}/leaderboard`, {
            auth: {
                username: KAGGLE_USERNAME,
                password: KAGGLE_API_KEY,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error.message);
        res.status(500).json({
            error: 'Failed to fetch leaderboard',
            message: error.message,
        });
    }
});

/**
 * GET /api/datasets
 * Search Kaggle datasets
 * Query params: search - Search term
 */
app.get('/api/datasets', async (req, res) => {
    try {
        const { search } = req.query;
        console.log(`📡 Searching datasets for: ${search || 'all'}`);

        const url = search
            ? `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(search)}`
            : 'https://www.kaggle.com/api/v1/datasets/list';

        const response = await axios.get(url, {
            auth: {
                username: KAGGLE_USERNAME,
                password: KAGGLE_API_KEY,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('❌ Error fetching datasets:', error.message);
        res.status(500).json({
            error: 'Failed to fetch datasets',
            message: error.message,
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   🚀 KAGGLE API PROXY SERVER                      ║
║   📡 Running on: http://localhost:${PORT}         ║
║   🔑 Username: ${KAGGLE_USERNAME}                 ║
║   ✅ CORS Enabled                                 ║
║   📊 Endpoints:                                   ║
║      - GET /health                                ║
║      - GET /api/competitions                      ║
║      - GET /api/competitions/:id                  ║
║      - GET /api/competitions/:id/leaderboard      ║
║      - GET /api/datasets                          ║
╚═══════════════════════════════════════════════════╝
  `);
});

// ========================================
// LEARNING NOTES FOR USMAN BHAI
// ========================================

/*
🎓 KYA SEEKHA?

1. BACKEND API KYA HAI?
   - Server jo frontend aur external API ke beech mein hota hai
   - Frontend directly Kaggle API call nahi kar sakta (CORS)
   - Backend server call karta hai, phir frontend ko data deta hai

2. CORS KYA HAI?
   - Cross-Origin Resource Sharing
   - Browser security feature
   - Agar frontend (localhost:5173) aur API (kaggle.com) different domains hain
   - Toh browser request block kar deta hai
   - Solution: Backend proxy server

3. EXPRESS KYA HAI?
   - Node.js framework for building web servers
   - Routes define karne ke liye (GET, POST, etc.)
   - Fast aur simple

4. AXIOS KYA HAI?
   - HTTP client library
   - API calls karne ke liye
   - Promises use karta hai (async/await)

5. ENVIRONMENT VARIABLES KYA HAIN?
   - Sensitive data (API keys) ko code se bahar rakhte hain
   - .env file mein store karte hain
   - Security ke liye important

6. KB USE HOTA HAI?
   - Jab browser se direct API call nahi ho sakta (CORS)
   - Jab API authentication chahiye (username/password)
   - Jab data transform karna ho (API response ko modify)
   - Jab rate limiting handle karni ho

7. KYU USE HOTA HAI?
   - Security: API keys browser mein expose nahi hote
   - Flexibility: Backend mein caching, logging add kar sakte hain
   - Control: Error handling better ho jata hai
*/
