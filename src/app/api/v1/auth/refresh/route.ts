import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '../../../../../lib/db';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const oldRefreshToken = cookieStore.get('refreshToken')?.value;

    if (!oldRefreshToken) {
      return NextResponse.json(
        { error: 'Refresh token missing' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find active session in database
    const session = await db.Session.findOne({
      where: { token: oldRefreshToken }
    });

    const s = session as any;

    if (!session) {
      // REFRESH TOKEN REUSE DETECTION:
      // Token is valid (signature verified above) but NOT found in DB.
      // This means it was already rotated — someone is replaying a stolen token.
      // Nuke ALL sessions for this user to protect the account.
      await db.Session.destroy({ where: { userId: decoded.id } });
      return NextResponse.json(
        { error: 'Suspicious activity detected. All sessions have been revoked. Please login again.' },
        { status: 401 }
      );
    }

    if (new Date() > new Date(s.expiresAt)) {
      await session.destroy();
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Fetch user details
    const user = await db.User.findByPk(decoded.id);
    if (!user) {
      await session.destroy();
      return NextResponse.json(
        { error: 'User does not exist' },
        { status: 401 }
      );
    }

    const u = user as any;

    // Rotate Tokens (Generate new ones)
    const payload = { id: u.id, email: u.email, role: u.role };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    // Update existing session in-place (preserves original createdAt, device info, IP)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await session.update({
      token: newRefreshToken,
      expiresAt
    });

    // Set new cookies
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60, // 5 min
      path: '/'
    });

    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return NextResponse.json({
      message: 'Token rotated and refreshed successfully',
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      }
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
