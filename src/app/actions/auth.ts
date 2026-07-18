'use server';

import { cookies } from 'next/headers';

export async function authenticate(passcode: string) {
  // Validate passcode against env variable or default master passcode
  const validPasscode = process.env.ADMIN_PASSCODE || 'India@2026';
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

export async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  const expectedToken = process.env.ADMIN_SESSION_TOKEN || 'fallback_secure_token_123';
  if (!session || session.value !== expectedToken) {
    throw new Error('Unauthorized administrative action. Please log in to the admin portal.');
  }
  return true;
}
