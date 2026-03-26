import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: req.cookies.get,
        set: res.cookies.set,
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = req.nextUrl.pathname

  // Not logged in → force login
  if (!user) {
    if (path !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return res
  }

  // Fetch role
  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userRow) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = userRow.role

  // Role-route enforcement
  if (path.startsWith('/admin') && role !== 'admin')
    return NextResponse.redirect(new URL('/login', req.url))

  if (path.startsWith('/authority') && role !== 'local_authority')
    return NextResponse.redirect(new URL('/login', req.url))

  if (path.startsWith('/user') && role !== 'civic_user')
    return NextResponse.redirect(new URL('/login', req.url))

  return res
}
