-- Storage RLS policies for gallery-images bucket

-- Public read of gallery images
drop policy if exists "gallery public read" on storage.objects;
create policy "gallery public read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'gallery-images');

-- Allow authenticated users to upload to gallery-images
drop policy if exists "gallery upload auth" on storage.objects;
create policy "gallery upload auth" on storage.objects
for insert to authenticated
with check (bucket_id = 'gallery-images');

-- Allow authenticated users to delete from gallery-images (MVP)
drop policy if exists "gallery delete auth" on storage.objects;
create policy "gallery delete auth" on storage.objects
for delete to authenticated
using (bucket_id = 'gallery-images');


