-- Add whatsapp_number to registrations table
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Update existing registrations to have a placeholder or keep it null
-- For new registrations, this field will be required in the UI
