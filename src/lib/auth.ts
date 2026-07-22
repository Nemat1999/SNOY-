import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_should_be_changed';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_should_be_changed';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    ACCESS_SECRET,
    { expiresIn: '5m' }
  );
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
