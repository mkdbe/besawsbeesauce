import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('admin_session')?.value
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
