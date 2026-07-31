import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './middlewares';

export function proxy(request: NextRequest) {
  // Execute modular admin auth middleware
  const adminAuthResult = adminAuthMiddleware(request);
  if (adminAuthResult) {
    return adminAuthResult;
  }

  // If no middleware returned a response, proceed to next
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
