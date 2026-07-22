import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '../../../../../lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      // Invalidate the session in DB
      await db.Session.destroy({ where: { token: refreshToken } });
    }

    // Clear authentication cookies
    cookieStore.set('accessToken', '', { maxAge: 0, path: '/' });
    cookieStore.set('refreshToken', '', { maxAge: 0, path: '/' });

    return NextResponse.json({
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
