const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [result] = await connection.execute("DELETE FROM Product WHERE id > 100");
  console.log(`Deleted ${result.affectedRows} products.`);
  await connection.end();
}
run();
