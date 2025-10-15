import { supabase } from "@/integrations/supabase/client";
import { compressImageToWebp } from "@/lib/image";

export const uploadAvatar = async (userId: string, file: File) => {
  // Compress client-side to reduce payload
  try {
    file = await compressImageToWebp(file, 1600, 0.8);
  } catch {}
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return data.publicUrl;
};

export const uploadGalleryImage = async (artisanId: string, file: File) => {
  try {
    file = await compressImageToWebp(file, 1600, 0.8);
  } catch {}
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${artisanId}/${fileName}`;

  const { error } = await supabase.storage
    .from("gallery-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("gallery-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteGalleryImage = async (imageUrl: string) => {
  // Extract the file path from the URL
  const urlParts = imageUrl.split("/gallery-images/");
  if (urlParts.length < 2) throw new Error("Invalid image URL");

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from("gallery-images")
    .remove([filePath]);

  if (error) throw error;
};
