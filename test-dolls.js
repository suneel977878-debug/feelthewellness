const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.execute("SELECT id, name, category, subcategory FROM Product WHERE id > 100");
  console.log(rows);
  await connection.end();
}
run();
