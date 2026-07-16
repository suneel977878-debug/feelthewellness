require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function run() {
  console.log("Connecting to Aiven MySQL...");
  const pool = mysql.createPool(process.env.DATABASE_URL);
  
  try {
    console.log("Adding defaultZoom...");
    await pool.query('ALTER TABLE Product ADD COLUMN defaultZoom FLOAT DEFAULT 1.0');
    console.log("Adding defaultZoomX...");
    await pool.query('ALTER TABLE Product ADD COLUMN defaultZoomX FLOAT DEFAULT 50.0');
    console.log("Adding defaultZoomY...");
    await pool.query('ALTER TABLE Product ADD COLUMN defaultZoomY FLOAT DEFAULT 50.0');
    console.log("Success! Columns added.");
  } catch (err) {
    console.error("Error (might already exist):", err.message);
  } finally {
    await pool.end();
  }
}

run();
