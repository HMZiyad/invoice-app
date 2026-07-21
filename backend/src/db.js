require('dotenv').config();
const { Pool } = require('pg');

// Disable SSL for local/Docker connections (host = localhost or db).
// Enable SSL only for external hosted databases (e.g. Supabase, Railway).
function getSslConfig(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    const isLocal = host === 'localhost' || host === 'db' || host === '127.0.0.1';
    return isLocal ? false : { rejectUnauthorized: false };
  } catch {
    return false;
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(process.env.DATABASE_URL),
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
});

module.exports = pool;

