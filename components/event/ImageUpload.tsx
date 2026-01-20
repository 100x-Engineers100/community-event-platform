'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { uploadEventImage, deleteEventImage } from '@/lib/utils/imageUpload'
import Image from 'next/image'

interface ImageUploadProps {
    userId: string
    onChange: (url: string) => void
    onRemove: () => void
    defaultValue?: string
    className?: string
}

export function ImageUpload({
    userId,
    onChange,
    onRemove,
    defaultValue,
    className
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(defaultValue || null)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (defaultValue) {
            setPreview(defaultValue)
        }
    }, [defaultValue])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            await handleUpload(file)
        }
    }

    const handleUpload = async (file: File) => {
        try {
            setIsUploading(true)
            // If there's an existing image (other than default), we might want to delete it from storage
            // But for simplicity and safety (don't delete if others use it), we'll just upload the new one
            const url = await uploadEventImage(file, userId)
            setPreview(url)
            onChange(url)
        } catch (error: any) {
            console.error('Upload failed:', error)
            alert(error.message || 'Failed to upload image')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = async () => {
        if (preview && !preview.includes('default-event-image')) {
            await deleteEventImage(preview)
        }
        setPreview(null)
        onRemove()
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            await handleUpload(file)
        }
    }

    return (
        <div className={cn("relative", className)}>
            <div
                className={cn(
                    "relative aspect-square rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                    isDragging ? "border-100x-accent-primary bg-100x-accent-primary/10" : "border-100x-border-default hover:border-100x-accent-primary bg-100x-bg-tertiary",
                    preview ? "border-transparent" : "p-8"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !preview && !isUploading && fileInputRef.current?.click()}
            >
                {isUploading && (
                    <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-100x-accent-primary" />
                    </div>
                )}

                {preview ? (
                    <div className="relative w-full h-full group">
                        <Image
                            src={preview}
                            alt="Event preview"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="bg-white text-black hover:bg-white/90"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Change
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                            >
                                <X className="w-4 h-4 mr-1" /> Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-100x-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-6 h-6 text-100x-text-secondary" />
                        </div>
                        <p className="text-sm font-medium text-100x-text-primary mb-1">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-100x-text-muted">
                            Square image recommended (640x640px)
                        </p>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    )
}
