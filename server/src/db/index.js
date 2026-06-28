require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
  console.log('DB URL:', process.env.DATABASE_URL); // temporary debug line
});

pool.on('error', (err) => {
  console.error('PostgreSQL error:', err.message);
});

module.exports = pool;