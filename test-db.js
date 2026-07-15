const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.execute("SELECT id, name, images FROM Product ORDER BY id DESC LIMIT 5");
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}
run();
