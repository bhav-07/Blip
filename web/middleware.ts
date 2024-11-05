import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup']
const PROTECTED_PATHS = ['/joinroom', '/chat']
const DEFAULT_LOGIN_REDIRECT = '/login'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const cookies = request.cookies
    const authToken = cookies.get('auth_token')
    const isAuthenticated = !!authToken?.value

    const pathStartsWith = (path: string, prefixes: string[]) => {
        return prefixes.some(prefix => path.startsWith(prefix))
    }

    if (pathStartsWith(pathname, PUBLIC_PATHS)) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/joinroom', request.url))
        }
        return NextResponse.next()
    }

    if (pathStartsWith(pathname, PROTECTED_PATHS)) {
        if (!isAuthenticated) {
            const response = NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url))
            response.cookies.delete('auth_token') // Clean up any invalid tokens
            return response
        }
        return NextResponse.next()
    }

    return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}