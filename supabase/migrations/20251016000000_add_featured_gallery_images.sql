-- Add is_featured column to gallery_images table
-- Allow artisans to highlight up to 3 featured products

-- Add the is_featured column
alter table public.gallery_images
add column if not exists is_featured boolean default false;

-- Create index for faster querying of featured images
create index if not exists idx_gallery_images_featured
on public.gallery_images(artisan_id, is_featured)
where is_featured = true;

-- Create a function to enforce max 3 featured images per artisan
create or replace function public.check_featured_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  featured_count int;
begin
  -- Only check if setting is_featured to true
  if NEW.is_featured = true then
    -- Count current featured images for this artisan (excluding the current row if updating)
    select count(*) into featured_count
    from public.gallery_images
    where artisan_id = NEW.artisan_id
      and is_featured = true
      and id != NEW.id;

    -- If already 3 featured images, reject the operation
    if featured_count >= 3 then
      raise exception 'Cannot feature more than 3 images. Please unfeature an existing image first.';
    end if;
  end if;

  return NEW;
end;
$$;

-- Create trigger to enforce the limit
drop trigger if exists check_featured_limit_trigger on public.gallery_images;
create trigger check_featured_limit_trigger
before insert or update on public.gallery_images
for each row
execute function public.check_featured_limit();

-- Comment
comment on column public.gallery_images.is_featured is
'Whether this image is featured in the artisan preview (max 3 per artisan)';
