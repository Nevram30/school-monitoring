import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // If user is authenticated, check role-based access
    if (token?.user?.role) {
      const userRole = token.user.role

      // Role-based redirections after login
      if (pathname === '/') {
        switch (userRole) {
          case 'admin':
            return NextResponse.redirect(new URL('/admin', req.url))
          case 'staff':
            return NextResponse.redirect(new URL('/staff', req.url))
          case 'faculty':
            return NextResponse.redirect(new URL('/faculty', req.url))
          default:
            return NextResponse.redirect(new URL('/login', req.url))
        }
      }

      // Protect admin routes
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Protect staff routes
      if (pathname.startsWith('/staff') && userRole !== 'staff') {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Protect faculty routes
      if (pathname.startsWith('/faculty') && userRole !== 'faculty') {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Protect dashboard routes (admin only)
      if (pathname.startsWith('/dashboard') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to login page without token
        if (pathname === '/login') {
          return true
        }
        
        // Require token for all other protected routes
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/staff/:path*',
    '/faculty/:path*',
    '/dashboard/:path*',
    '/api/items/:path*',
    '/api/members/:path*',
    '/api/borrows/:path*',
    '/api/rooms/:path*',
    '/api/reports/:path*',
    '/api/users/:path*'
  ]
}
