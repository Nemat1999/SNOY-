import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { UAParser } from 'ua-parser-js';
import { Op } from 'sequelize';
import db from '../../../../../lib/db';
import { signAccessToken, signRefreshToken } from '../../../../../lib/auth';
import { checkRateLimit } from '../../../../../lib/rateLimit';

export async function POST(req: Request) {
  try {
    // Rate limit check (5 attempts per IP per 5 minutes)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again after ${rateLimit.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const u = user as any;

    // Compare password
    const isMatch = await bcrypt.compare(password, u.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const payload = { id: u.id, email: u.email, role: u.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Parse User-Agent into clean readable format (e.g. "Chrome on Windows 11")
    const rawUA = req.headers.get('user-agent') || '';
    const parser = new UAParser(rawUA);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const userAgent = rawUA
      ? `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'}${os.version ? ' ' + os.version : ''}`
      : 'Unknown';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Store session in DB (Refresh Token)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.Session.create({
      userId: u.id,
      token: refreshToken,
      userAgent,
      ipAddress,
      expiresAt
    });

    // Garbage Collection: Clean up expired sessions (fire-and-forget)
    db.Session.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() }
      }
    }).catch(() => {}); // Silently ignore cleanup errors

    // Set cookies
    const cookieStore = await cookies();
    
    // Set Access Token (5 minutes)
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60, // 5 min
      path: '/'
    });

    // Set Refresh Token (7 days)
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
