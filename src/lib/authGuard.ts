import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken, TokenPayload } from './auth';
import db from './db';

/**
 * Auth Guard — Reusable authentication checker for API routes.
 * 
 * Modes:
 * - "basic":  Sirf JWT signature verify karta hai (fast — for GET/public routes)
 * - "strict": JWT verify + DB session existence check 
 *             (for sensitive actions: checkout, profile update, password change)
 *             Isse "Logout All" ke baad 5-min window exploit nahi hoga.
 * 
 * Usage in any route:
 *   const auth = await authGuard(req, 'strict');
 *   if (auth.error) return auth.error;
 *   // auth.user is available with id, email, role
 */

interface AuthSuccess {
  user: TokenPayload;
  error: null;
}

interface AuthFailure {
  user: null;
  error: NextResponse;
}

type AuthResult = AuthSuccess | AuthFailure;

export async function authGuard(
  req: Request,
  mode: 'basic' | 'strict' = 'basic'
): Promise<AuthResult> {
  // 1. Extract access token from cookies or Authorization header
  let token: string | undefined;

  try {
    const cookieStore = await cookies();
    token = cookieStore.get('accessToken')?.value;
  } catch (err) {
    // Outside Next.js request context (e.g. standalone test or CLI environment)
  }

  if (!token) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized: Access token missing' },
        { status: 401 }
      )
    };
  }

  // 2. Verify JWT signature & expiry
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized: Access token invalid or expired' },
        { status: 401 }
      )
    };
  }

  // 3. For strict mode — verify user still has an active session in DB
  if (mode === 'strict') {
    const activeSession = await db.Session.findOne({
      where: { userId: decoded.id }
    });

    if (!activeSession) {
      // User's sessions were revoked (e.g., Logout All) but access token hasn't expired yet
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized: Session has been revoked. Please login again.' },
          { status: 401 }
        )
      };
    }
  }

  return { user: decoded, error: null };
}
