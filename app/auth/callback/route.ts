import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      let redirectTo = next

      if (user) {
        console.log('[AUTH CALLBACK] User logged in:', user.email)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('[AUTH CALLBACK] Profile lookup error:', profileError)
        }

        if (profile?.is_admin) {
          console.log('[AUTH CALLBACK] User is admin, redirecting to /admin')
          redirectTo = '/admin'
        } else {
          console.log('[AUTH CALLBACK] User is regular user, redirecting to:', redirectTo)
        }
      } else {
        console.warn('[AUTH CALLBACK] Session exchanged but no user found')
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    } else {
      console.error('[AUTH CALLBACK] Error exchanging code for session:', error)
    }
  }

  console.error('[AUTH CALLBACK] Authentication failed or no code provided')
  // Error case - redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
