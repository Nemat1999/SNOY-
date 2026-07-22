import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { authGuard } from '../../../../../lib/authGuard';

export async function GET(req: Request) {
  try {
    // Authenticate request using authGuard
    const auth = await authGuard(req, 'basic');
    if (auth.error) {
      return auth.error;
    }

    // Fetch user from database excluding password
    const user = await db.User.findByPk(auth.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user
    });
  } catch (error: any) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
