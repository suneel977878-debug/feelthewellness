const fs = require('fs');
const mysql = require('mysql2/promise');

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("No DATABASE_URL in .env");
        process.exit(1);
    }
    
    console.log("Connecting to", url);
    const connection = await mysql.createConnection(url);
    
    const sql = fs.readFileSync('import_new_products.sql', 'utf8');
    const queries = sql.split(';').filter(q => q.trim());
    
    console.log(`Executing ${queries.length} queries...`);
    let success = 0;
    
    for (let i=0; i<queries.length; i++) {
        try {
            await connection.query(queries[i]);
            success++;
        } catch (e) {
            console.error(`Error on query ${i}:`, e.message);
        }
    }
    
    console.log(`Successfully executed ${success} queries.`);
    connection.end();
}

main().catch(console.error);
