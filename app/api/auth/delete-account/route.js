import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { AuthCredentials, Users } from '@/configs/schema';
import { clearSessionCookie } from '@/lib/auth';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(req) {
  try {
    const user = await getSessionUser(req);

    if (!user?.email) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      clearSessionCookie(response);
      return response;
    }

    await db.delete(AuthCredentials).where(eq(AuthCredentials.email, user.email));
    await db.delete(Users).where(eq(Users.email, user.email));

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('Delete account failed:', error);
    return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 });
  }
}
