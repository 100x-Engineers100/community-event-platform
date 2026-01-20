'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SafeImageProps {
    src?: string | null
    alt: string
    className?: string
    priority?: boolean
    fill?: boolean
    width?: number
    height?: number
}

const DEFAULT_IMAGE = '/images/default-event-image.png'

/**
 * SafeImage Component
 * A robust image component that handles broken URLs and fallbacks.
 * Simplified to the absolute minimum to prevent loading hangs.
 */
export function SafeImage({ src, alt, className, priority, fill, width, height }: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(src || DEFAULT_IMAGE)
    const [hasFailedOnce, setHasFailedOnce] = useState(false)

    useEffect(() => {
        const primary = src?.trim()
        const validSrc = primary && primary !== 'null' && primary !== 'undefined' ? primary : DEFAULT_IMAGE
        setImgSrc(validSrc)
        setHasFailedOnce(false)
    }, [src])

    const handleError = () => {
        if (!hasFailedOnce) {
            setImgSrc(DEFAULT_IMAGE)
            setHasFailedOnce(true)
        }
    }

    // If even the default fails, show a stylized div instead of a broken icon
    if (hasFailedOnce && imgSrc === DEFAULT_IMAGE) {
        return (
            <div className={cn("bg-zinc-900 flex items-center justify-center border border-zinc-800 w-full h-full", className)}>
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center px-4">
                    Image Not Available
                </span>
            </div>
        )
    }

    return (
        <img
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            onError={handleError}
            className={className || "object-cover w-full h-full"}
        />
    )
}
