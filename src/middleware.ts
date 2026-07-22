import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  const isAdminProtectedRoute = pathname.startsWith('/admin/dashboard');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAdminRootRoute = pathname === '/admin';

  // 1. Unauthenticated user trying to access /admin/dashboard -> redirect to /admin/login
  if (isAdminProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Accessing /admin root -> redirect to dashboard if authenticated, else to login
  if (isAdminRootRoute) {
    const targetUrl = new URL(isAuthenticated ? '/admin/dashboard' : '/admin/login', request.url);
    return NextResponse.redirect(targetUrl);
  }

  // 3. Already authenticated user trying to access /admin/login -> redirect to /admin/dashboard
  if (isAdminLoginRoute && isAuthenticated) {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
