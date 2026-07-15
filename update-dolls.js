const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [result] = await connection.execute("UPDATE Product SET subcategory = 'Sex Dolls' WHERE category = 'Men Sex Toys' AND id > 100");
  console.log(`Updated ${result.affectedRows} dolls.`);
  await connection.end();
}
run();
