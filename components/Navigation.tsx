'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogOut, Menu, X } from 'lucide-react'
import { Profile } from '@/lib/types'

interface NavigationProps {
  user: Profile
}

export function Navigation({ user }: NavigationProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4"
      style={{
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      <div
        className="max-w-7xl mx-auto rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{
          background: 'rgba(10, 10, 10, 0.6)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
              <div className="w-10 h-10 bg-100x-accent-primary rounded-lg flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(249,104,70,0.5)]">
                <span className="text-white font-bold text-base">100x</span>
              </div>
              <span className="font-bold text-100x-text-primary text-lg hidden sm:inline transition-all group-hover:text-100x-accent-primary group-hover:drop-shadow-[0_0_8px_rgba(249,104,70,0.3)]">
                Community Events
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-100x-text-secondary">
                <span className="text-100x-text-primary font-medium">{user.full_name}</span>
                <span className="mx-2">•</span>
                <span>{user.affiliation}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="border-100x-accent-primary text-100x-accent-primary hover:bg-100x-accent-primary hover:text-white transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-100x-text-primary hover:text-100x-accent-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-screen w-64 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col p-6 space-y-4 mt-16">
          <div className="text-sm text-100x-text-secondary pb-4 border-b border-100x-border-default">
            <div className="text-100x-text-primary font-medium">{user.full_name}</div>
            <div className="text-xs mt-1">{user.email}</div>
            <div className="text-xs mt-1">{user.affiliation}</div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full border-100x-accent-primary text-100x-accent-primary hover:bg-100x-accent-primary hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}
