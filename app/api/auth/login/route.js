import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { AuthCredentials, Users } from '@/configs/schema';
import { createSessionToken, sanitizeUser, setSessionCookie, verifyPassword } from '@/lib/auth';
import { ensureAuthCredentialsTable } from '@/lib/auth-server';

export async function POST(req) {
  try {
    await ensureAuthCredentialsTable();

    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const users = await db.select().from(Users).where(eq(Users.email, email)).limit(1);
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const credentials = await db.select().from(AuthCredentials).where(eq(AuthCredentials.email, email)).limit(1);
    if (credentials.length === 0) {
      return NextResponse.json(
        { error: 'This account has no local password yet. Please sign up with this email to set one.' },
        { status: 401 }
      );
    }

    const passwordOk = verifyPassword(password, credentials[0].passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const user = users[0];
    const token = createSessionToken(user);
    const response = NextResponse.json({ user: sanitizeUser(user) });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
