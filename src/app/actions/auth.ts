'use server';

import { cookies } from 'next/headers';

export async function authenticate(passcode: string) {
  // Validate passcode against env variable or default passcodes for multiple staff/partner access
  const envPasscodes = process.env.ADMIN_PASSCODE ? process.env.ADMIN_PASSCODE.split(',').map(p => p.trim()) : [];
  const validPasscodes = ['Sunil@2026', 'Staff@2026', 'Admin@2026', 'FeelTheWellness@2026', 'Partner@2026', ...envPasscodes];
  const sessionToken = process.env.ADMIN_SESSION_TOKEN || 'fallback_secure_token_123';
  
  if (validPasscodes.includes(passcode.trim())) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days multi-user session
      path: '/'
    });
    return { success: true };
  }
  
  return { success: false, error: 'Invalid administrator passcode. Please try again.' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
