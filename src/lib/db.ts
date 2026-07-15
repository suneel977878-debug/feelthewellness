import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL || 'mysql://user:pass@localhost:3306/db';
    pool = mysql.createPool(url);
  }
  return pool;
}

export default new Proxy({}, {
  get: (target, prop) => {
    const p = getPool() as any;
    return typeof p[prop] === 'function' ? p[prop].bind(p) : p[prop];
  }
}) as mysql.Pool;
