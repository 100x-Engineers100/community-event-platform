-- Storage Setup for Event Images
-- Run this in Supabase SQL Editor to create bucket (if not using Dashboard) and set policies

-- Create the bucket through SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for event-images bucket

-- 1. Allow public read access to all images
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- 2. Allow authenticated users to upload images
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- 3. Allow users to update their own images
CREATE POLICY "Owner Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Allow users to delete their own images
CREATE POLICY "Owner Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND (storage.foldername(name))[1] = auth.uid()::text);
