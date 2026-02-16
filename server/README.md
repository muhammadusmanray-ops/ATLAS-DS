# 🚀 Kaggle API Backend Setup Guide

## 📋 Kya Hai Ye?

Ye ek **proxy server** hai jo Kaggle API aur aapke frontend ke beech mein kaam karta hai.

### ❓ Kyun Chahiye?

**Problem:** Browser directly Kaggle API call nahi kar sakta (CORS error)
**Solution:** Backend server Kaggle API call karta hai, phir frontend ko data deta hai

```
Frontend (Browser) → Backend Server → Kaggle API
                   ← Backend Server ← Kaggle API
```

---

## 🛠️ Setup Steps (5 Minutes)

### Step 1: Server Folder Mein Jao
```bash
cd server
```

### Step 2: Dependencies Install Karo
```bash
npm install
```

**Kya install hoga:**
- `express` - Web server framework
- `cors` - CORS enable karne ke liye
- `axios` - HTTP requests ke liye
- `dotenv` - Environment variables ke liye

### Step 3: Server Start Karo
```bash
npm start
```

**Ya development mode mein (auto-restart):**
```bash
npm run dev
```

### Step 4: Test Karo
Browser mein kholo: http://localhost:3001/health

**Agar ye dikhe toh server chal raha hai:**
```json
{
  "status": "OK",
  "message": "Kaggle Proxy Server is running"
}
```

---

## 🎯 Kaise Use Karein?

### Frontend Se Call Karo

```javascript
// Pehle (Direct API - CORS error)
fetch('https://www.kaggle.com/api/v1/competitions/list')  // ❌ Blocked

// Ab (Proxy server se)
fetch('http://localhost:3001/api/competitions')  // ✅ Works!
```

---

## 📡 Available Endpoints

### 1. Health Check
```
GET http://localhost:3001/health
```
Server status check karne ke liye

### 2. Get All Competitions
```
GET http://localhost:3001/api/competitions
```
Sab competitions ki list

### 3. Get Competition Details
```
GET http://localhost:3001/api/competitions/titanic
```
Specific competition ki details

### 4. Get Leaderboard
```
GET http://localhost:3001/api/competitions/titanic/leaderboard
```
Competition ka leaderboard

### 5. Search Datasets
```
GET http://localhost:3001/api/datasets?search=house+prices
```
Datasets search karo

---

## 🔧 Troubleshooting

### Error: "Cannot find module 'express'"
**Solution:**
```bash
cd server
npm install
```

### Error: "Port 3001 already in use"
**Solution:** `.env` file mein port change karo:
```
PORT=3002
```

### Error: "Kaggle API authentication failed"
**Solution:** `.env` file check karo:
```
KAGGLE_USERNAME=muhammadusmanray
KAGGLE_API_KEY=KGAT_f48f4d253845e53a8f1b40f5d2c998ac
```

---

## 🎓 Learning Notes

### Backend API Kya Hai?
- Server jo frontend aur external API ke beech mein hota hai
- Data fetch karke frontend ko deta hai
- Security aur CORS issues solve karta hai

### CORS Kya Hai?
- Cross-Origin Resource Sharing
- Browser security feature
- Different domains ke beech requests block karta hai
- Backend server se bypass ho jata hai

### Express Kya Hai?
- Node.js framework
- Web servers banane ke liye
- Routes define karne ke liye (GET, POST, etc.)

### Axios Kya Hai?
- HTTP client library
- API calls karne ke liye
- Promises use karta hai (async/await)

---

## 🚀 Production Deployment

### Vercel/Netlify Par Deploy Karne Ke Liye:

1. **Separate Repository Banao** (backend ke liye)
2. **Environment Variables Add Karo** (Vercel dashboard mein)
3. **Frontend URL Update Karo:**
```javascript
const PROXY_URL = process.env.VITE_API_URL || 'http://localhost:3001';
```

---

## 📊 Performance

- **Response Time:** ~200-500ms (Kaggle API speed par depend karta hai)
- **Rate Limits:** Kaggle API ke limits apply hote hain
- **Caching:** Future mein add kar sakte hain (faster responses)

---

## ✅ Next Steps

1. ✅ Server start karo
2. ✅ Frontend refresh karo
3. ✅ Kaggle Ops section kholo
4. ✅ "Refresh" button click karo
5. ✅ Real competitions dikhengi!

---

**Questions? Issues? Let me know!** 🦾🚀✨
