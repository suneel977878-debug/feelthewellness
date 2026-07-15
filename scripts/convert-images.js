const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mysql = require('mysql2/promise');

const DIRS = [
  { path: 'public/banners', width: 1920, quality: 80 },
  { path: 'public/categories', width: 800, quality: 80 },
  { path: 'public/products', width: 800, quality: 82 },
  { path: 'public', files: ['hero.png'], width: 1920, quality: 85 }
];

async function convertImage(filePath, width, quality) {
  const ext = path.extname(filePath);
  if (!['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase())) return null;
  if (filePath.includes('default_product') && ext.toLowerCase() === '.jpg') {
    // create small placeholder
    width = 400; quality = 60;
  }
  const newPath = filePath.replace(new RegExp(`${ext}$`, 'i'), '.webp');
  try {
    let img = sharp(filePath);
    const metadata = await img.metadata();
    if (metadata.width > width) {
      img = img.resize(width);
    }
    await img.webp({ quality }).toFile(newPath);
    // Remove original
    fs.unlinkSync(filePath);
    return { old: ext, new: '.webp' };
  } catch (err) {
    console.error(`Error converting ${filePath}:`, err);
    return null;
  }
}

async function processDir(dirInfo) {
  const dirPath = path.join(__dirname, '..', dirInfo.path);
  if (!fs.existsSync(dirPath)) return;
  
  const files = dirInfo.files || fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isFile()) {
      await convertImage(fullPath, dirInfo.width, dirInfo.quality);
    }
  }
}

async function updateDb() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.execute("SELECT id, images FROM Product");
  
  for (const row of rows) {
    if (row.images) {
      const oldImagesStr = typeof row.images === 'string' ? row.images : JSON.stringify(row.images);
      const newImagesStr = oldImagesStr.replace(/\.jpg/gi, '.webp').replace(/\.png/gi, '.webp').replace(/\.jpeg/gi, '.webp');
      if (oldImagesStr !== newImagesStr) {
        await connection.execute("UPDATE Product SET images = ? WHERE id = ?", [newImagesStr, row.id]);
      }
    }
  }
  await connection.end();
}

async function run() {
  console.log('Converting images...');
  for (const dir of DIRS) {
    await processDir(dir);
  }
  console.log('Images converted. Updating DB...');
  if (process.env.DATABASE_URL) {
    await updateDb();
    console.log('DB updated.');
  } else {
    console.log('No DATABASE_URL found.');
  }
}

run();
