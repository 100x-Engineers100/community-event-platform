-- Add event_image_url column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_image_url text DEFAULT '/images/default-event-image.jpg';
