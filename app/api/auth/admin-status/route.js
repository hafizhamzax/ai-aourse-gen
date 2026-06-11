import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { Users } from '@/configs/schema';
import { isAdminSignupEnabled } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admins = await db.select({ id: Users.id }).from(Users).where(eq(Users.role, 'admin')).limit(1);
    const adminExists = admins.length > 0;
    return NextResponse.json({
      adminExists,
      adminSignupEnabled: !adminExists && isAdminSignupEnabled(),
    });
  } catch (error) {
    console.error('Failed to fetch admin status:', error);
    return NextResponse.json({ error: 'Failed to fetch admin status' }, { status: 500 });
  }
}
