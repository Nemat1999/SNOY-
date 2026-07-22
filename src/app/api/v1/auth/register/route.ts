import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../../lib/db';
import { checkRateLimit } from '../../../../../lib/rateLimit';

export async function POST(req: Request) {
  try {
    // Rate limit check (5 attempts per IP per 5 minutes)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Try again after ${rateLimit.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { name, email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    const allowedRoles = ['user', 'super_admin'];
    const userRole = role && allowedRoles.includes(role) ? role : 'user';

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole
    });

    const u = newUser as any;

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
