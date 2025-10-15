-- Add missing telegram field to artisans table
ALTER TABLE public.artisans
  ADD COLUMN IF NOT EXISTS telegram text NULL;
