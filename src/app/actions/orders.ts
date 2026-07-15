'use server';

import pool from '../../lib/db';
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
function mapDbOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    orderId: dbOrder.orderId,
    amount: dbOrder.amount,
    date: dbOrder.createdAt ? new Date(dbOrder.createdAt).toISOString() : new Date().toISOString(),
    status: dbOrder.status as any,
    deliveryStatus: dbOrder.deliveryStatus as any || undefined,
    deliveryNote: dbOrder.deliveryNote || undefined,
    utr: dbOrder.utr || undefined,
    paymentApp: dbOrder.paymentApp || undefined,
    customer: {
      name: dbOrder.customerName,
      phone: dbOrder.customerPhone,
      address: dbOrder.customerAddress
    },
    items: dbOrder.items.map((item: any) => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  };
}

export async function getOrders() {
  try {
    const [rows] = await pool.query('SELECT * FROM `Order` ORDER BY createdAt DESC');
    const orders = rows as any[];
    
    // Fetch items for each order
    for (const order of orders) {
      const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId = ?', [order.id]);
      order.items = itemRows;
      
      // Date conversion to match Prisma structure
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

export async function createOrder(data: Omit<Order, 'id' | 'date'>) {
  const [result] = await pool.query(
    `INSERT INTO \`Order\` (orderId, amount, status, deliveryStatus, deliveryNote, utr, paymentApp, customerName, customerPhone, customerAddress, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      data.orderId, data.amount, data.status, data.deliveryStatus || null, data.deliveryNote || null,
      data.utr || null, data.paymentApp || null, data.customer.name, data.customer.phone, data.customer.address
    ]
  );
  
  const insertId = (result as any).insertId;
  
  for (const item of data.items) {
    await pool.query(
      `INSERT INTO OrderItem (productId, name, price, quantity, orderId) VALUES (?, ?, ?, ?, ?)`,
      [item.id, item.name, item.price, item.quantity, insertId]
    );
  }
  
  const [rows] = await pool.query('SELECT * FROM `Order` WHERE id = ?', [insertId]);
  const order = (rows as any[])[0];
  order.date = order.createdAt;
  
  const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId = ?', [insertId]);
  order.items = itemRows;
  
  return mapDbOrder(order);
}

export async function updateOrderStatus(orderId: string, status: 'VERIFIED' | 'FAILED') {
  await pool.query('UPDATE `Order` SET status = ?, updatedAt = NOW() WHERE orderId = ?', [status, orderId]);
  
  const [rows] = await pool.query('SELECT * FROM `Order` WHERE orderId = ?', [orderId]);
  const order = (rows as any[])[0];
  order.date = order.createdAt;
  
  const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId = ?', [order.id]);
  order.items = itemRows;
  
  return mapDbOrder(order);
}

export async function updateDeliveryTracking(orderId: string, status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED', note: string) {
  await pool.query('UPDATE `Order` SET deliveryStatus = ?, deliveryNote = ?, updatedAt = NOW() WHERE orderId = ?', [status, note, orderId]);
  
  const [rows] = await pool.query('SELECT * FROM `Order` WHERE orderId = ?', [orderId]);
  const order = (rows as any[])[0];
  order.date = order.createdAt;
  
  const [itemRows] = await pool.query('SELECT * FROM OrderItem WHERE orderId = ?', [order.id]);
  order.items = itemRows;
  
  return mapDbOrder(order);
}

export async function clearOrders() {
  await pool.query('DELETE FROM OrderItem');
  await pool.query('DELETE FROM `Order`');
  return true;
}
