export async function compressImageToWebp(
  file: File,
  maxSizePx = 1600,
  quality = 0.75
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSizePx / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.round(bitmap.width * scale);
  const targetH = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality)
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });
}
