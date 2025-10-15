-- RLS policies for gallery_images so creators can manage their own images

-- Ensure RLS is enabled
alter table public.gallery_images enable row level security;

drop policy if exists "gallery select" on public.gallery_images;
create policy "gallery select" on public.gallery_images
for select to anon, authenticated
using (true);

drop policy if exists "gallery insert own" on public.gallery_images;
create policy "gallery insert own" on public.gallery_images
for insert to authenticated
with check (
  exists (
    select 1 from public.artisans a
    where a.id = artisan_id
      and a.user_id = auth.uid()
  )
);

drop policy if exists "gallery update own" on public.gallery_images;
create policy "gallery update own" on public.gallery_images
for update to authenticated
using (
  exists (
    select 1 from public.artisans a
    where a.id = artisan_id
      and a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.artisans a
    where a.id = artisan_id
      and a.user_id = auth.uid()
  )
);

drop policy if exists "gallery delete own" on public.gallery_images;
create policy "gallery delete own" on public.gallery_images
for delete to authenticated
using (
  exists (
    select 1 from public.artisans a
    where a.id = artisan_id
      and a.user_id = auth.uid()
  )
);

-- Optional: Grant table privileges (RLS still enforced)
grant select on public.gallery_images to anon, authenticated;
grant insert, update, delete on public.gallery_images to authenticated;


