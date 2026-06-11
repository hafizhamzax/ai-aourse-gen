import { NextResponse } from 'next/server';
import { clearSessionCookie, sanitizeUser } from '@/lib/auth';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Failed to load session user:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
