export const DEFAULT_IMAGES = [
    '/images/1.png',
    '/images/2.png',
    '/images/3.png',
    '/images/default-event-image.png'
]

/**
 * Deterministically picks a random image from the default set based on the event ID.
 */
export function getSeededRandomImage(eventId: string): string {
    let hash = 0
    for (let i = 0; i < eventId.length; i++) {
        hash = eventId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return DEFAULT_IMAGES[Math.abs(hash) % DEFAULT_IMAGES.length]
}

/**
 * Returns the image to display for an event.
 * If event_image_url is a provided custom image (not one of the defaults), it returns it.
 * Otherwise, it returns a deterministic random image based on the event ID.
 */
export function getEventDisplayImage(eventId: string, eventImageUrl?: string | null): string {
    // If no image is provided, or it's one of our internal defaults, we want the seeded random one
    // to ensure consistency across the platform even for legacy events.
    const isInternalDefault = !eventImageUrl ||
        eventImageUrl === '/images/default-event-image.png' ||
        DEFAULT_IMAGES.includes(eventImageUrl)

    if (isInternalDefault) {
        return getSeededRandomImage(eventId)
    }

    return eventImageUrl
}
