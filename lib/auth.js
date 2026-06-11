import crypto from 'crypto';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from './auth-constants';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT secret. Set JWT_SECRET in environment variables.');
  }
  return JWT_SECRET;
}

function safeEqual(a, b) {
  const aBuffer = Buffer.from(String(a || ''));
  const bBuffer = Buffer.from(String(b || ''));

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function sign(value) {
  return crypto.createHmac('sha256', getJwtSecret()).update(value).digest('base64url');
}

function base64urlJsonEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function base64urlJsonDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 120000;
  const digest = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `${iterations}:${salt}:${digest}`;
}

export function verifyPassword(password, storedHash) {
  try {
    const [iterationsStr, salt, expectedDigest] = String(storedHash || '').split(':');
    const iterations = Number(iterationsStr);

    if (!iterations || !salt || !expectedDigest) return false;

    const digest = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    return safeEqual(digest, expectedDigest);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

export function createSessionToken(user) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: String(user.id),
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
    iat: nowInSeconds,
    exp: nowInSeconds + SESSION_MAX_AGE_SECONDS,
  };

  const encodedHeader = base64urlJsonEncode(header);
  const encodedPayload = base64urlJsonEncode(payload);
  const tokenBody = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(tokenBody);
  return `${tokenBody}.${signature}`;
}

export function verifySessionToken(token) {
  try {
    if (!token) return null;

    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) return null;

    const header = base64urlJsonDecode(encodedHeader);
    if (header?.alg !== 'HS256' || header?.typ !== 'JWT') return null;

    const tokenBody = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = sign(tokenBody);
    if (!safeEqual(signature, expectedSignature)) return null;

    const payload = base64urlJsonDecode(encodedPayload);
    if (!payload?.email || !payload?.exp) return null;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (Number(payload.exp) <= nowInSeconds) return null;

    return payload;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl || null,
    role: user.role || 'user',
  };
}
