import { createClient } from '@/lib/supabase/client'

export async function validateImageFile(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

    if (file.size > MAX_SIZE) {
        throw new Error('File size exceeds 5MB limit')
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Only JPG, PNG and WebP images are allowed')
    }

    return true
}

export async function uploadEventImage(file: File, userId: string): Promise<string> {
    const supabase = createClient()

    // Validate file
    await validateImageFile(file)

    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${timestamp}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file)

    if (error) {
        console.error('Upload error:', error)
        throw new Error('Failed to upload image')
    }

    const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath)

    return publicUrl
}

export async function deleteEventImage(publicUrl: string) {
    const supabase = createClient()

    // Extract path from public URL
    // Example URL: https://xxx.supabase.co/storage/v1/object/public/event-images/user_id/filename.jpg
    try {
        const url = new URL(publicUrl)
        const pathParts = url.pathname.split('/event-images/')
        if (pathParts.length < 2) return

        const filePath = pathParts[1]
        const { error } = await supabase.storage
            .from('event-images')
            .remove([filePath])

        if (error) {
            console.error('Error deleting image:', error)
        }
    } catch (error) {
        console.error('Invalid URL for deletion:', error)
    }
}
