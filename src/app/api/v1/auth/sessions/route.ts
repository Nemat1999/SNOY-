import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '../../../../../lib/db';
import { verifyAccessToken } from '../../../../../lib/auth';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('accessToken')?.value;

    // Fallback to Authorization Header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Access token missing' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized: Access token invalid or expired' },
        { status: 401 }
      );
    }

    // Fetch active sessions
    const sessions = await db.Session.findAll({
      where: { userId: decoded.id },
      attributes: ['id', 'token', 'userAgent', 'ipAddress', 'expiresAt', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    const currentRefreshToken = cookieStore.get('refreshToken')?.value;

    const sessionList = sessions.map((sess: any) => ({
      id: sess.id,
      userAgent: sess.userAgent,
      ipAddress: sess.ipAddress,
      expiresAt: sess.expiresAt,
      createdAt: sess.createdAt,
      isCurrentDevice: currentRefreshToken === sess.token
    }));

    return NextResponse.json({
      sessions: sessionList
    });
  } catch (error: any) {
    console.error('Sessions list error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
