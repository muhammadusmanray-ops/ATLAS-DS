import pg from 'pg';
import mysql from 'mysql2/promise';
import { promisify } from 'util';
import path from 'path';

const { Pool } = pg;

// Production Connection Pool Cache
const pools = {};

/**
 * Executes a query against a REAL database.
 * Supports: Postgres, MySQL
 */
export async function queryDatabase(config, query) {
    if (!config || !config.type) {
        throw new Error('Database configuration missing. Please provide connection parameters.');
    }

    const { type, host, port, user, password, database } = config;

    if (!host || !user || !password || !database) {
        throw new Error('Missing DB connection parameters (host, user, password, database)');
    }

    console.log(`🔌 Connecting to PRODUCTION ${type}...`);

    try {
        if (type === 'postgres') {
            const connectionString = `postgresql://${user}:${password}@${host}:${port || 5432}/${database}`;

            // Singleton Pool Pattern
            if (!pools[connectionString]) {
                const pool = new Pool({
                    connectionString,
                    ssl: { rejectUnauthorized: false }, // Required for AWS/Neon/Supabase
                    max: 10,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 10000,
                });

                pool.on('error', (err) => {
                    console.error('💥 Unexpected error on idle DB client:', err.message);
                });

                pools[connectionString] = pool;
            }

            const client = await pools[connectionString].connect();
            try {
                const res = typeof query === 'string'
                    ? await client.query(query)
                    : await client.query(query.text, query.values);
                return res.rows;
            } finally {
                client.release();
            }

        } else if (type === 'mysql') {
            const connection = await mysql.createConnection({
                host, port: port || 3306, user, password, database
            });
            try {
                const [rows] = await connection.execute(query);
                return rows;
            } finally {
                await connection.end();
            }

        } else {
            throw new Error(`Unsupported database type: ${type}`);
        }
    } catch (error) {
        console.error('❌ PRODUCTION DB ERROR:', error.message);
        throw error;
    }
}
