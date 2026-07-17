import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.DATABASE_URL || 'NOT_SET';
  // Mask password
  const maskedUrl = url.replace(/:(.*?)@/, ':****@');
  
  try {
    const startTime = Date.now();
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM Product');
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'SUCCESS',
      databaseUrl: maskedUrl,
      productCount: (rows as any[])[0].count,
      durationMs: duration
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      databaseUrl: maskedUrl,
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorErrno: error.errno,
      errorStack: error.stack
    }, { status: 500 });
  }
}
