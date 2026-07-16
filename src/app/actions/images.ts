'use server';

import pool from '../../lib/db';
import { revalidatePath } from 'next/cache';

export async function updateProductImageConfig(
  productId: number,
  images: string[],
  imageCrops: { zoom: number; x: number; y: number }[]
) {
  try {
    await pool.query(
      `UPDATE Product SET images = ?, imageCrops = ?, updatedAt = NOW() WHERE id = ?`,
      [
        JSON.stringify(images),
        JSON.stringify(imageCrops),
        productId
      ]
    );
    
    // Revalidate paths so the changes reflect immediately
    revalidatePath(`/product/${productId}`);
    revalidatePath('/');
    revalidatePath('/catalog');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating product images:", error);
    return { success: false, error: "Failed to update images" };
  }
}
