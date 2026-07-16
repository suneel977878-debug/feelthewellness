
const mysql = require('mysql2/promise');

async function run() {
  console.log("Connecting to MySQL...");
  const pool = mysql.createPool(process.env.DATABASE_URL);
  
  try {
    console.log("Adding imageCrops...");
    await pool.query('ALTER TABLE Product ADD COLUMN imageCrops TEXT NULL');
    console.log("Success! Column added.");
  } catch (err) {
    console.error("Error (might already exist):", err.message);
  } finally {
    await pool.end();
  }
}

run();
