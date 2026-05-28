import crypto from 'crypto';

const DEFAULT_PASSWORD = 'liqu2025';

// Server-side secret for signing tokens (rotates on restart — acceptable for this use case)
const SECRET = crypto.randomBytes(32).toString('hex');

// Active tokens (in-memory, resets on cold start)
const activeTokens = new Set<string>();

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

/** Verify admin password — checks env ADMIN_PASSWORD first, then default */
export function verifyPassword(input: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) {
    return crypto.timingSafeEqual(
      Buffer.from(hashPassword(input)),
      Buffer.from(hashPassword(envPassword))
    );
  }
  return crypto.timingSafeEqual(
    Buffer.from(hashPassword(input)),
    Buffer.from(hashPassword(DEFAULT_PASSWORD))
  );
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
