'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { Spotlight } from "@/components/ui/spotlight"
import { motion } from 'framer-motion'
import { LogIn, Sparkles } from 'lucide-react'

function LoginForm() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('[ERROR] Login error:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-3xl shadow-2xl rounded-[32px] p-8 md:p-10">
        {/* Card Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-100x-accent-primary/10 blur-[60px] rounded-full" />

        <div className="relative space-y-8">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-16 h-16 bg-100x-accent-primary rounded-2xl flex items-center justify-center shadow-lg shadow-100x-accent-primary/20 mb-6"
              >
                <span className="text-black font-black text-2xl tracking-tighter">100x</span>
              </motion.div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                The Portal to <span className="text-100x-accent-primary">Events</span>
              </h1>
              <p className="text-zinc-500 font-medium text-sm max-w-[240px] mx-auto">
                Where engineers meet, chaos ensues, and code actually works. Probably.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Wait, something went wrong. Try again?
              </motion.div>
            )}

            <Button
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-black text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-100x-accent-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center gap-3 relative z-10">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            </Button>
          </div>

          <div className="pt-4 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 text-zinc-700">
              <div className="h-px w-8 bg-zinc-800" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">The Boring Legal Bit</span>
              <div className="h-px w-8 bg-zinc-800" />
            </div>
            <p className="text-[10px] text-center text-zinc-600 font-medium">
              By joining, you agree to treat everyone with respect and maybe share your snacks. Also our regular Terms apply.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual Background */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-100x-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Animated Elements */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-[20%] right-[10%] text-100x-accent-primary hidden md:block"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      <Suspense fallback={
        <div className="w-full max-w-md h-[400px] bg-zinc-900 animate-pulse rounded-[32px]" />
      }>
        <LoginForm />
      </Suspense>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800">
          Built for the 100x Engineers Community
        </p>
      </div>
    </div>
  )
}
