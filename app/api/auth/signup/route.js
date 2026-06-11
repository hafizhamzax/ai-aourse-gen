import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { AuthCredentials, Users } from '@/configs/schema';
import { createSessionToken, hashPassword, sanitizeUser, setSessionCookie } from '@/lib/auth';
import { ensureAuthCredentialsTable, hasValidAdminSignupKey, isAdminSignupEnabled } from '@/lib/auth-server';

export async function POST(req) {
  try {
    await ensureAuthCredentialsTable();

    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const adminPassword = String(body?.adminPassword || '');

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existingUser = await db.select().from(Users).where(eq(Users.email, email)).limit(1);
    const adminExistsResult = await db.select({ id: Users.id }).from(Users).where(eq(Users.role, 'admin')).limit(1);
    const adminExists = adminExistsResult.length > 0;
    const grantAdmin = !adminExists && isAdminSignupEnabled() && hasValidAdminSignupKey(adminPassword);
    const hashed = hashPassword(password);

    let userRecord;

    if (existingUser.length > 0) {
      const user = existingUser[0];
      const existingCredential = await db
        .select()
        .from(AuthCredentials)
        .where(eq(AuthCredentials.email, email))
        .limit(1);

      if (existingCredential.length > 0) {
        return NextResponse.json({ error: 'Email already exists. Please sign in.' }, { status: 409 });
      }

      const nextRole = user.role === 'admin' ? 'admin' : grantAdmin ? 'admin' : user.role || 'user';
      const updated = await db
        .update(Users)
        .set({ name: name || user.name, role: nextRole })
        .where(eq(Users.email, email))
        .returning();

      await db.insert(AuthCredentials).values({
        email,
        passwordHash: hashed,
      });

      userRecord = updated[0];
    } else {
      const role = grantAdmin ? 'admin' : 'user';

      const inserted = await db
        .insert(Users)
        .values({
          name,
          email,
          imageUrl: null,
          role,
        })
        .returning();

      userRecord = inserted[0];

      await db.insert(AuthCredentials).values({
        email,
        passwordHash: hashed,
      });
    }

    const token = createSessionToken(userRecord);
    const response = NextResponse.json({
      user: sanitizeUser(userRecord),
      isAdmin: userRecord.role === 'admin',
      adminExists: adminExists || userRecord.role === 'admin',
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Signup failed:', error);
    return NextResponse.json({ error: 'Signup failed.' }, { status: 500 });
  }
}
