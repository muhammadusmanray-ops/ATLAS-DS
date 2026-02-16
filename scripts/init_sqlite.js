import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
    try {
        const db = await open({
            filename: './atlas_test.db',
            driver: sqlite3.Database
        });

        console.log('✅ Created/Opened atlas_test.db');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                amount REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT
            );
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                role TEXT
            );
        `);

        // Insert Dummy Data if empty
        const count = await db.get('SELECT count(*) as c FROM transactions');
        if (count.c === 0) {
            console.log('🔄 Seeding dummy data...');
            await db.exec(`
                INSERT INTO transactions (user_id, amount, status) VALUES 
                ('U101', 500.00, 'COMPLETED'),
                ('U102', 120.50, 'PENDING'),
                ('U103', 999.99, 'COMPLETED'),
                ('U101', 45.00, 'FAILED'),
                ('U104', 2500.00, 'COMPLETED');
                
                INSERT INTO users (username, role) VALUES
                ('admin', 'superuser'),
                ('analyst', 'viewer');
            `);
            console.log('✅ Seeded Data.');
        }

        console.log('🚀 Database Ready: ./atlas_test.db');

    } catch (e) {
        console.error('Error initializing DB:', e);
    }
})();
