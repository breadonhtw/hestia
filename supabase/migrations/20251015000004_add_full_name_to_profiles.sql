-- Add full_name column to profiles table if it doesn't exist
-- This ensures the profiles table has the full_name column that the code expects

-- Add full_name column if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text;

-- Update existing records to use full_name instead of display_name if display_name exists
-- (This handles the case where the column was named display_name before)
DO $$
BEGIN
  -- Check if display_name column exists and full_name is empty
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'display_name'
  ) THEN
    -- Copy display_name to full_name where full_name is null or empty
    UPDATE public.profiles 
    SET full_name = display_name 
    WHERE (full_name IS NULL OR full_name = '') 
    AND display_name IS NOT NULL 
    AND display_name != '';
    
    -- Drop the old display_name column
    ALTER TABLE public.profiles DROP COLUMN IF EXISTS display_name;
  END IF;
END $$;

-- Make full_name NOT NULL with a default value for new records
ALTER TABLE public.profiles
  ALTER COLUMN full_name SET DEFAULT '';

-- Update any remaining NULL values to empty string
UPDATE public.profiles 
SET full_name = '' 
WHERE full_name IS NULL;
