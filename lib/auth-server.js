import { eq, sql } from 'drizzle-orm';
import { db } from '@/configs/db';
import { Users } from '@/configs/schema';
import { SESSION_COOKIE_NAME } from './auth-constants';
import { verifySessionToken } from './auth';
import crypto from 'crypto';

export async function ensureAuthCredentialsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS auth_credentials (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);
}

export async function getSessionUser(req) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);
  if (!payload?.email) return null;

  const users = await db.select().from(Users).where(eq(Users.email, payload.email)).limit(1);
  return users[0] || null;
}

function safeEqual(a, b) {
  const aBuffer = Buffer.from(String(a || ''));
  const bBuffer = Buffer.from(String(b || ''));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function getAdminSignupKey() {
  // Use env variable if set, otherwise fallback to a default for initial setup
  return process.env.ADMIN_SIGNUP_KEY || process.env.ADMIN_SIGNUP_PASSWORD || 'ADMIN123';
}

export function isAdminSignupEnabled() {
  return Boolean(getAdminSignupKey());
}

export function hasValidAdminSignupKey(adminPassword) {
  const configuredKey = getAdminSignupKey();
  if (!configuredKey || !adminPassword) return false;
  return safeEqual(adminPassword, configuredKey);
}
