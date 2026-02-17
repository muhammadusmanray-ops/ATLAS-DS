import app from './index.js';

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 ATLAS LOCAL BACKEND ACTIVE ON PORT ${PORT}`);
});
