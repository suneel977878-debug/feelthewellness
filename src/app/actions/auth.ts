'use server';

import { cookies } from 'next/headers';

export async function authenticate(passcode: string) {
  // Validate passcode against env variable or master passcode Sunil@2026
  const validPasscode = process.env.ADMIN_PASSCODE || 'Sunil@2026';
  const sessionToken = process.env.ADMIN_SESSION_TOKEN || 'fallback_secure_token_123';
  
  if (passcode.trim() === validPasscode) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days simultaneous multi-device session
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
