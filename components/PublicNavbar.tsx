'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4"
      style={{
        // Ensure backdrop-filter works in Safari
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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-10 bg-100x-accent-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-base">100x</span>
              </div>
              <span className="font-bold text-100x-text-primary text-lg hidden sm:inline transition-colors group-hover:text-100x-accent-primary">
                Builders' Hub
              </span>
            </Link>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard">

              </Link>

              <Link href="/login">
                <Button className="bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white transition-all duration-300">
                  Host a community event
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-100x-text-primary hover:text-100x-accent-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-screen w-64 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col p-6 space-y-4 mt-16">
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-100x-accent-primary text-100x-accent-primary hover:bg-100x-accent-primary hover:text-white transition-all"
            >
              Host a community event
            </Button>
          </Link>

          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 -z-10"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  )
}
