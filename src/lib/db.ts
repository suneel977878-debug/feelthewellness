import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL || 'mysql://user:pass@localhost:3306/db';
    
    // Strip unsupported query params so mysql2 doesn't choke on them
    const cleanUrl = url.replace(/\?.*$/, '');
    
    pool = mysql.createPool({
      uri: cleanUrl,
      ssl: {
        rejectUnauthorized: false  // Aiven requires SSL but we skip cert verification
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

export default new Proxy({}, {
  get: (target, prop) => {
    const p = getPool() as any;
    return typeof p[prop] === 'function' ? p[prop].bind(p) : p[prop];
  }
}) as mysql.Pool;
