'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface GlassMorphCardProps {
  className?: string
}

/**
 * 3D Glassmorphism Card Component
 *
 * Features:
 * - Frosted glass effect with backdrop blur
 * - 3D tilt animation on hover
 * - Parallax mouse tracking
 * - Orange accent glow (100x brand color)
 * - Respects prefers-reduced-motion
 * - Mobile responsive
 */
export function GlassMorphCard({ className = '' }: GlassMorphCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return

      const { clientX, clientY } = e
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const deltaX = (clientX - centerX) / centerX
      const deltaY = (clientY - centerY) / centerY

      setMousePosition({ x: deltaX * 10, y: deltaY * 10 })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isHovered, prefersReducedMotion])

  return (
    <motion.div
      className={`glass-morph-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateY: isHovered ? mousePosition.x * 0.5 : 3,
        rotateX: isHovered ? -mousePosition.y * 0.5 : -2,
        translateZ: isHovered ? 20 : 0,
      }}
      transition={{
        opacity: { duration: 0.8, ease: 'easeOut' },
        scale: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
        rotateY: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
        rotateX: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
        translateZ: { duration: 0.4, ease: 'easeOut' },
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Main glass surface */}
      <div className="glass-surface" />

      {/* Light reflection gradient overlay */}
      <div className="glass-reflection" />

      {/* Orange glow border effect */}
      <div className="glass-glow" />
    </motion.div>
  )
}
