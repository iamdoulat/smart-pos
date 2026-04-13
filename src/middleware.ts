import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token') || request.headers.get('Authorization');

    const { pathname } = request.nextUrl;

    // Public paths - no auth required
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
    const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '?'));

    if (isPublicPath) {
        // If already logged in, redirect away from auth pages to dashboard
        if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // For dashboard and other protected routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
