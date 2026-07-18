'use server';

import pool from '../../lib/db';
import { verifyAdminAuth } from './auth';

export interface Order {
  id?: string;
  orderId: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  deliveryStatus?: 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  deliveryNote?: string;
  utr?: string;
  paymentApp?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
}

// Helper to convert DB Order to app Order
// Helper to convert DB Order to app Order
function mapDbOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    orderId: dbOrder.orderId,
    amount: dbOrder.amount || 0,
    date: dbOrder.createdAt ? new Date(dbOrder.createdAt).toISOString() : new Date().toISOString(),
    status: dbOrder.status as any || 'PENDING',
    deliveryStatus: dbOrder.deliveryStatus as any || undefined,
    deliveryNote: dbOrder.deliveryNote || undefined,
    utr: dbOrder.utr || undefined,
    paymentApp: dbOrder.paymentApp || undefined,
    customer: {
      name: dbOrder.customerName || 'Guest Customer',
      phone: dbOrder.customerPhone || 'N/A',
      address: dbOrder.customerAddress || 'N/A'
    },
    items: (dbOrder.items || []).map((item: any) => ({
      id: item.productId,
      name: item.name || 'Unknown Item',
      price: item.price || 0,
      quantity: item.quantity || 1
    }))
  };
}

export async function getOrders() {
  await verifyAdminAuth();
  try {
    const [rows] = await pool.query('SELECT * FROM `Order` ORDER BY createdAt DESC');
    const orders = rows as any[];
    if (orders.length === 0) return [];
    
    // Fetch all items in a single query (resolving N+1 problem)
    const orderIds = orders.map(o => o.id);
    const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId IN (?)', [orderIds]);
    const allItems = itemRows as any[];
    
    // Group items by orderId in memory
    const itemsByOrderId = new Map<number, any[]>();
    for (const item of allItems) {
      const list = itemsByOrderId.get(item.orderId) || [];
      list.push(item);
      itemsByOrderId.set(item.orderId, list);
    }
    
    for (const order of orders) {
      order.items = itemsByOrderId.get(order.id) || [];
      order.date = order.createdAt;
    }
    
    return orders.map(mapDbOrder);
  } catch(error) {
    console.error("MySQL Error Orders:", error);
    return [];
  }
}

export async function getOrderByDisplayId(displayId: string): Promise<Order | null> {
  try {
    const [rows] = await pool.query('SELECT * FROM `Order` WHERE orderId = ?', [displayId]);
    const orders = rows as any[];
    if (orders.length === 0) return null;
    
    const order = orders[0];
    const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId = ?', [order.id]);
    order.items = itemRows;
    order.date = order.createdAt;
    
    return mapDbOrder(order);
  } catch (error) {
    console.error("MySQL Fetch Order Error:", error);
    return null;
  }
}

export async function verifyAndGetOrder(displayId: string, phone: string): Promise<Order | null> {
  const order = await getOrderByDisplayId(displayId);
  if (!order) return null;
  
  // Basic normalization for comparison (strip spaces/dashes)
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const orderPhone = (order.customer?.phone || '').replace(/\D/g, '');
  
  if (cleanPhone && (cleanPhone === orderPhone || (phone || '').toLowerCase() === (order.customer?.phone || '').toLowerCase())) {
    return order;
  }
  return null;
}

export async function createOrder(data: Omit<Order, 'id' | 'date'>) {
  // Check if order already exists to prevent duplicate insertions due to React Strict Mode double mounting
  const existingOrder = await getOrderByDisplayId(data.orderId);
  if (existingOrder) {
    return existingOrder;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO \`Order\` (orderId, amount, status, deliveryStatus, deliveryNote, utr, paymentApp, customerName, customerPhone, customerAddress, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.orderId, data.amount, data.status || 'PENDING', data.deliveryStatus || null, data.deliveryNote || null,
        data.utr || null, data.paymentApp || null, data.customer?.name || 'Guest Customer', data.customer?.phone || 'N/A', data.customer?.address || 'N/A'
      ]
    );
    
    const insertId = (result as any).insertId;
    
    for (const item of (data.items || [])) {
      await connection.query(
        `INSERT INTO OrderItem (productId, name, price, quantity, orderId) VALUES (?, ?, ?, ?, ?)`,
        [item.id, item.name, item.price, item.quantity, insertId]
      );
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  
  return await getOrderByDisplayId(data.orderId) as Order;
}

export async function updateOrderStatus(orderId: string, status: 'VERIFIED' | 'FAILED') {
  await verifyAdminAuth();
  await pool.query('UPDATE `Order` SET status = ?, updatedAt = NOW() WHERE orderId = ?', [status, orderId]);
  
  const [rows] = await pool.query('SELECT * FROM `Order` WHERE orderId = ?', [orderId]);
  const order = (rows as any[])[0];
  if (!order) throw new Error('Order not found after status update');
  order.date = order.createdAt;
  
  const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId = ?', [order.id]);
  order.items = itemRows;
  
  return mapDbOrder(order);
}

export async function updateDeliveryTracking(orderId: string, status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED', note: string) {
  await verifyAdminAuth();
  await pool.query('UPDATE `Order` SET deliveryStatus = ?, deliveryNote = ?, updatedAt = NOW() WHERE orderId = ?', [status, note, orderId]);
  
  const [rows] = await pool.query('SELECT * FROM `Order` WHERE orderId = ?', [orderId]);
  const order = (rows as any[])[0];
  if (!order) throw new Error('Order not found after delivery tracking update');
  order.date = order.createdAt;
  
  const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId = ?', [order.id]);
  order.items = itemRows;
  
  return mapDbOrder(order);
}

export async function clearOrders() {
  await verifyAdminAuth();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM OrderItem');
    await connection.query('DELETE FROM `Order`');
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
