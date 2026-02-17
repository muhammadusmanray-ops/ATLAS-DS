import { MongoClient } from 'mongodb';

// MongoDB Atlas Connection (For Authentication)
const MONGO_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI;

let mongoClient = null;
let authDB = null;

export const connectMongo = async () => {
    if (authDB) return authDB;

    try {
        console.log('🔗 [MONGO] Connecting to Atlas...');
        mongoClient = new MongoClient(MONGO_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
        });

        await mongoClient.connect();
        authDB = mongoClient.db('atlas_auth');
        console.log('✅ [MONGO] Connected successfully');
        return authDB;
    } catch (error) {
        console.error('❌ [MONGO] Connection failed:', error.message);
        throw error;
    }
};

export const getAuthDB = async () => {
    if (!authDB) {
        await connectMongo();
    }
    return authDB;
};

// Collections
export const getUsersCollection = async () => {
    const db = await getAuthDB();
    return db.collection('users');
};

export const getSessionsCollection = async () => {
    const db = await getAuthDB();
    return db.collection('sessions');
};
