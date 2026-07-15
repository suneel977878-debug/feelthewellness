const fs = require('fs');
const path = require('path');
const https = require('https');
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute("SELECT id, images FROM Product WHERE images LIKE '%http%'");
  console.log(`Found ${rows.length} products with external images.`);

  const destDir = path.join(__dirname, 'public', 'products');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const row of rows) {
    try {
      const urls = JSON.parse(row.images);
      const newUrls = [];
      let updated = false;

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        if (url.startsWith('http')) {
          const ext = path.extname(new URL(url).pathname) || '.jpg';
          const filename = `prod_${row.id}_${i}${ext}`;
          const destPath = path.join(destDir, filename);
          
          console.log(`Downloading ${url} to ${filename}...`);
          
          await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destPath);
            https.get(url, { rejectUnauthorized: false }, (response) => {
              if (response.statusCode >= 400) {
                 reject(new Error('Status ' + response.statusCode));
                 return;
              }
              response.pipe(file);
              file.on('finish', () => {
                file.close();
                resolve();
              });
            }).on('error', (err) => {
              fs.unlink(destPath, () => {});
              reject(err);
            });
          });
          
          newUrls.push(`/products/${filename}`);
          updated = true;
        } else {
          newUrls.push(url);
        }
      }

      if (updated) {
        await connection.execute('UPDATE Product SET images = ? WHERE id = ?', [JSON.stringify(newUrls), row.id]);
        console.log(`Updated product ${row.id} in DB.`);
      }
    } catch (e) {
      console.error(`Failed on product ${row.id}:`, e.message);
    }
  }

  await connection.end();
  console.log('Done!');
}

run().catch(console.error);
