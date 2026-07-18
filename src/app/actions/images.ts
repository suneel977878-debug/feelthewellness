'use server';

import pool from '../../lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdminAuth } from './auth';

export async function updateProductImageConfig(
  productId: number,
  images: string[],
  imageCrops: { zoom: number; x: number; y: number }[]
) {
  try {
    await verifyAdminAuth();
    await pool.query(
      `UPDATE Product SET images = ?, imageCrops = ?, updatedAt = NOW() WHERE id = ?`,
      [
        JSON.stringify(images),
        JSON.stringify(imageCrops),
        productId
      ]
    );
    
    // Revalidate paths & tags so changes reflect immediately everywhere
    revalidateTag('products', 'max');
    revalidatePath(`/product/${productId}`);
    revalidatePath('/');
    revalidatePath('/catalog');
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating product images:", error);
    return { success: false, error: error?.message || "Failed to update images" };
  }
}
