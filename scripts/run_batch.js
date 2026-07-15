const fs = require('fs');
const mysql = require('mysql2/promise');

async function main() {
  console.log("Reading SQL file...");
  const sql = fs.readFileSync('scripts/import_batch.sql', 'utf8');
  
  console.log("Connecting to Database...");
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    multipleStatements: true
  });
  
  console.log("Executing queries...");
  try {
    const [results] = await connection.query(sql);
    console.log("Batch executed successfully. Affected rows may vary based on IGNORE constraints.");
  } catch (err) {
    console.error("Error executing batch:", err.message);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
