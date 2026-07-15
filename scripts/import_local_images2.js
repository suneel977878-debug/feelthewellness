const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mysql = require('mysql2/promise');

const SOURCE_DIR = path.join(__dirname, '..', 'new products', 'for antigravity', 'Downloaded_Images');
const TARGET_DIR = path.join(__dirname, '..', 'public', 'products');

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [products] = await connection.execute('SELECT id, name FROM Product');
  
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const folders = fs.readdirSync(SOURCE_DIR);
  let updatedCount = 0;

  for (const folder of folders) {
    const folderPath = path.join(SOURCE_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    // Find product match by name
    const product = products.find(p => p.name.trim().toLowerCase() === folder.trim().toLowerCase());
    
    if (product) {
      // Process images
      const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      const imagePaths = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const srcPath = path.join(folderPath, file);
        const newFilename = `prod_${product.id}_${i}.webp`;
        const targetPath = path.join(TARGET_DIR, newFilename);
        
        try {
          let img = sharp(srcPath);
          const metadata = await img.metadata();
          if (metadata.width > 800) {
            img = img.resize(800);
          }
          await img.webp({ quality: 82 }).toFile(targetPath);
          imagePaths.push(`/products/${newFilename}`);
        } catch (err) {
          console.error(`Error processing ${srcPath}:`, err);
        }
      }
      
      if (imagePaths.length > 0) {
        await connection.execute(
          'UPDATE Product SET images = ? WHERE id = ?',
          [JSON.stringify(imagePaths), product.id]
        );
        updatedCount++;
        console.log(`Updated images for product: ${product.name} (${imagePaths.length} images)`);
      }
    } else {
      console.log(`No product match found for folder: ${folder}`);
    }
  }

  await connection.end();
  console.log(`Done. Updated ${updatedCount} products.`);
}

run().catch(console.error);
