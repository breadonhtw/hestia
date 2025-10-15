-- Ensure artisans table has all required columns
-- This migration adds any missing columns that the code expects

-- Add missing columns to artisans table if they don't exist
ALTER TABLE public.artisans
  ADD COLUMN IF NOT EXISTS craft_type text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS telegram text,
  ADD COLUMN IF NOT EXISTS external_shop_url text,
  ADD COLUMN IF NOT EXISTS contact_channel text,
  ADD COLUMN IF NOT EXISTS contact_value text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS accepting_orders boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hours jsonb,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_artisans_updated_at ON public.artisans;
CREATE TRIGGER update_artisans_updated_at
    BEFORE UPDATE ON public.artisans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure RLS is enabled
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies if they don't exist
DO $$
BEGIN
    -- Users can view their own artisan profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'artisans' 
        AND policyname = 'Users can view own artisan profile'
    ) THEN
        CREATE POLICY "Users can view own artisan profile"
            ON public.artisans
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Users can update their own artisan profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'artisans' 
        AND policyname = 'Users can update own artisan profile'
    ) THEN
        CREATE POLICY "Users can update own artisan profile"
            ON public.artisans
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    -- Users can insert their own artisan profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'artisans' 
        AND policyname = 'Users can insert own artisan profile'
    ) THEN
        CREATE POLICY "Users can insert own artisan profile"
            ON public.artisans
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
