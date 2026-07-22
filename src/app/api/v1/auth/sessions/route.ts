import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '../../../../../lib/db';
import { authGuard } from '../../../../../lib/authGuard';

export async function GET(req: Request) {
  try {
    const auth = await authGuard(req, 'strict');
    if (auth.error) {
      return auth.error;
    }

    // Fetch active sessions
    const sessions = await db.Session.findAll({
      where: { userId: auth.user.id },
      attributes: ['id', 'token', 'userAgent', 'ipAddress', 'expiresAt', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    const cookieStore = await cookies();
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
