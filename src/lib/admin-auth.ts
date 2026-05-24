import crypto from 'crypto';

// SHA-256 hash of the admin password — never store plaintext
const PASSWORD_HASH = '2d599fa69db07c9dc1f591e8504ce0d2000cef67dce74d6726fa1d12f281e085';

// Server-side secret for signing tokens (rotates on restart — acceptable for this use case)
const SECRET = crypto.randomBytes(32).toString('hex');

// Active tokens (in-memory, resets on cold start)
const activeTokens = new Set<string>();

/** Verify admin password using constant-time comparison */
export function verifyPassword(input: string): boolean {
  const inputHash = crypto.createHash('sha256').update(input).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(PASSWORD_HASH));
  } catch {
    return false;
  }
}

/** Create a signed admin session token */
export function createToken(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(12).toString('hex');
  const payload = `${timestamp}:${random}`;
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  const token = `${payload}:${signature}`;

  activeTokens.add(token);
  return token;
}

/** Verify an admin session token */
export function verifyToken(token: string): boolean {
  if (!activeTokens.has(token)) return false;

  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [timestamp, random, signature] = parts;
  const payload = `${timestamp}:${random}`;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Remove a token (logout) */
export function revokeToken(token: string): void {
  activeTokens.delete(token);
}

/** Extract token from Authorization header */
export function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export function requireAdmin(request: Request): { authorized: true } | { authorized: false; error: string; status: number } {
  const token = extractToken(request);
  if (!token || !verifyToken(token)) {
    return { authorized: false, error: '未授权访问', status: 401 };
  }
  return { authorized: true };
}
