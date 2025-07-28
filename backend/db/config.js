import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'escomparte_db',
  user: 'postgres',
  password: 'admin'
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    const res = await client.query('SELECT NOW()');
    console.log('PostgreSQL server time:', res.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  }
};

export { pool, testConnection };
