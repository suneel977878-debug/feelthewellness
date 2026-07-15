import { products } from './src/data/products';
import * as fs from 'fs';

let sql = '';
for (const p of products) {
  const images = JSON.stringify(p.images).replace(/'/g, "''");
  const features = JSON.stringify(p.features).replace(/'/g, "''");
  const name = p.name.replace(/'/g, "''");
  const desc = p.description.replace(/'/g, "''");
  
  sql += `INSERT INTO Product (id, name, price, description, images, category, subcategory, features, isNew, isBestSeller, isOnSale, discountPercent, rating, reviews, color, silhouetteType, createdAt, updatedAt) VALUES (${p.id}, '${name}', ${p.price}, '${desc}', '${images}', '${p.category}', ${p.subcategory ? `'${p.subcategory}'` : 'NULL'}, '${features}', ${p.isNew ? 1 : 0}, ${p.isBestSeller ? 1 : 0}, ${p.isOnSale ? 1 : 0}, ${p.discountPercent || 'NULL'}, ${p.rating}, ${p.reviews}, '${p.color}', '${p.silhouetteType}', NOW(), NOW());\n`;
}

// Add StoreConfig initial data
sql += `INSERT IGNORE INTO StoreConfig (id, ageGateEnabled, storeUpiId, paytmMid, paytmKey, paytmEnv, updatedAt) VALUES (1, 1, 'luxurydiscreet@ybl', '', '', 'SIMULATED', NOW());\n`;

fs.writeFileSync('seed_products.sql', sql);
console.log('SQL generated.');
