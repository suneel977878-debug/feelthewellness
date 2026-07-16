'use server';


import { Product } from '../../data/products';

function mapDbProduct(p: any): Product {
  let parsedImages = [];
  let parsedFeatures = [];
  try {
    parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
    // Fix broken images: old products were stored in DB as .jpg but exist on disk as .webp
    if (Array.isArray(parsedImages)) {
      parsedImages = parsedImages.map((img: any) => {
        if (typeof img === 'string' && img.match(/\/prod_\d+_\d+\.jpg$/)) {
          return img.replace(/\.jpg$/, '.webp');
        }
        return img;
      });
    }
  } catch (e) {}
  try {
    parsedFeatures = typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []);
  } catch (e) {}

  let parsedImageCrops = [];
  try {
    parsedImageCrops = typeof p.imageCrops === 'string' ? JSON.parse(p.imageCrops) : (p.imageCrops || []);
  } catch (e) {}

  return {
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    images: parsedImages,
    category: p.category,
    subcategory: p.subcategory || undefined,
    features: parsedFeatures,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    isOnSale: p.isOnSale,
    discountPercent: p.discountPercent || undefined,
    rating: p.rating,
    reviews: p.reviews,
    color: p.color,
    silhouetteType: p.silhouetteType,
    defaultZoom: p.defaultZoom || 1.0,
    defaultZoomX: p.defaultZoomX || 50.0,
    defaultZoomY: p.defaultZoomY || 50.0,
    imageCrops: parsedImageCrops
  };
}

import pool from '../../lib/db';

export async function getProducts() {
  try {
    const [rows] = await pool.query('SELECT * FROM Product ORDER BY createdAt DESC');
    return (rows as any[]).map(mapDbProduct);
  } catch (error) {
    console.error("MySQL Fetch Error:", error);
    return [];
  }
}

export async function getProductById(id: number) {
  try {
    const [rows] = await pool.query('SELECT * FROM Product WHERE id = ?', [id]);
    const products = rows as any[];
    if (products.length === 0) return null;
    return mapDbProduct(products[0]);
  } catch (error) {
    console.error("MySQL Fetch Error:", error);
    return null;
  }
}

export async function getRelatedProducts(category: string, excludeId: number, limit: number = 4) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Product WHERE category = ? AND id != ? ORDER BY isBestSeller DESC, id DESC LIMIT ?',
      [category, excludeId, limit]
    );
    return (rows as any[]).map(mapDbProduct);
  } catch (error) {
    console.error("MySQL Fetch Error:", error);
    return [];
  }
}

export async function createProduct(data: Omit<Product, 'id'>) {
  const [result] = await pool.query(
    `INSERT INTO Product (name, price, description, images, category, subcategory, features, isNew, isBestSeller, isOnSale, discountPercent, rating, reviews, color, silhouetteType, defaultZoom, defaultZoomX, defaultZoomY, imageCrops, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.name, data.price, data.description, JSON.stringify(data.images),
      data.category, data.subcategory || null, JSON.stringify(data.features),
      data.isNew ? 1 : 0, data.isBestSeller ? 1 : 0, data.isOnSale ? 1 : 0,
      data.discountPercent || null, data.rating || 5.0, data.reviews || 0,
      data.color || null, data.silhouetteType || null,
      data.defaultZoom ?? 1.0, data.defaultZoomX ?? 50.0, data.defaultZoomY ?? 50.0,
      JSON.stringify(data.imageCrops || [])
    ]
  );
  
  const insertId = (result as any).insertId;
  const [rows] = await pool.query('SELECT * FROM Product WHERE id = ?', [insertId]);
  return mapDbProduct((rows as any[])[0]);
}

export async function updateProduct(data: Product) {
  await pool.query(
    `UPDATE Product SET name = ?, price = ?, description = ?, images = ?, category = ?, subcategory = ?, features = ?, isNew = ?, isBestSeller = ?, isOnSale = ?, discountPercent = ?, rating = ?, reviews = ?, color = ?, silhouetteType = ?, defaultZoom = ?, defaultZoomX = ?, defaultZoomY = ?, imageCrops = ?, updatedAt = NOW() WHERE id = ?`,
    [
      data.name, data.price, data.description, JSON.stringify(data.images),
      data.category, data.subcategory || null, JSON.stringify(data.features),
      data.isNew ? 1 : 0, data.isBestSeller ? 1 : 0, data.isOnSale ? 1 : 0,
      data.discountPercent || null, data.rating || 5.0, data.reviews || 0,
      data.color || null, data.silhouetteType || null,
      data.defaultZoom ?? 1.0, data.defaultZoomX ?? 50.0, data.defaultZoomY ?? 50.0,
      JSON.stringify(data.imageCrops || []),
      data.id
    ]
  );
  
  const [rows] = await pool.query('SELECT * FROM Product WHERE id = ?', [data.id]);
  return mapDbProduct((rows as any[])[0]);
}

export async function deleteProduct(id: number) {
  await pool.query('DELETE FROM Product WHERE id = ?', [id]);
  return true;
}

export async function bulkUpdatePrices(productIds: number[], type: 'increase' | 'decrease', unit: 'amount' | 'percentage', value: number) {
  if (productIds.length === 0) return true;
  
  const placeholders = productIds.map(() => '?').join(',');
  const [rows] = await pool.query(`SELECT * FROM Product WHERE id IN (${placeholders})`, productIds);
  const productsToUpdate = rows as any[];

  for (const p of productsToUpdate) {
    let newPrice = p.price;
    if (unit === 'amount') {
      newPrice = type === 'increase' ? p.price + value : p.price - value;
    } else {
      const modifier = p.price * (value / 100);
      newPrice = type === 'increase' ? p.price + modifier : p.price - modifier;
    }
    
    newPrice = Math.max(1, Math.round(newPrice));

    await pool.query(
      `UPDATE Product SET price = ?, isOnSale = ?, discountPercent = ? WHERE id = ?`,
      [
        newPrice,
        type === 'decrease' ? 1 : 0,
        type === 'decrease' && unit === 'percentage' ? value : null,
        p.id
      ]
    );
  }
  return true;
}
