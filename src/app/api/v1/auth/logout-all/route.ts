import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '../../../../../lib/db';
import { verifyAccessToken } from '../../../../../lib/auth';

export async function POST(req: Request) {
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

    // Revoke all sessions for the user in database
    await db.Session.destroy({
      where: { userId: decoded.id }
    });

    // Clear authentication cookies
    cookieStore.set('accessToken', '', { maxAge: 0, path: '/' });
    cookieStore.set('refreshToken', '', { maxAge: 0, path: '/' });

    return NextResponse.json({
      message: 'Logged out from all devices successfully'
    });
  } catch (error: any) {
    console.error('Logout all devices error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
