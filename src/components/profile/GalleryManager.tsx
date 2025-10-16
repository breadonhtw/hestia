import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uploadGalleryImage, deleteGalleryImage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X, Upload as UploadIcon, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MAX_FEATURED_IMAGES } from "@/constants/gallery";
import { ImageCropDialog } from "@/components/ImageCropDialog";

interface GalleryManagerProps {
  artisanId: string;
}

export const GalleryManager = ({ artisanId }: GalleryManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState<string>("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const processNextFile = useCallback(() => {
    if (pendingFiles.length === 0) {
      // All files have been processed
      if (totalFiles > 1) {
        toast({
          title: "Cropping complete",
          description: `All ${totalFiles} images have been cropped and are ready for upload.`,
        });
      }
      setCurrentFileIndex(0);
      setTotalFiles(0);
      return;
    }

    // Calculate index BEFORE taking the file out of the queue
    const currentIndex = totalFiles - pendingFiles.length;
    setCurrentFileIndex(currentIndex);

    const [nextFile, ...remaining] = pendingFiles;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentCropImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(nextFile);
    setPendingFiles(remaining);
  }, [pendingFiles, totalFiles, toast]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pendingFiles.length > 0 && !cropDialogOpen) {
      processNextFile();
    }
  }, [pendingFiles, cropDialogOpen, processNextFile]);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery", artisanId],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("artisan_id", artisanId)
        .order("display_order", { ascending: true });
      return data || [];
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      const image = images?.find((img) => img.id === imageId);

      // Try to delete from storage first (but don't fail if it errors)
      if (image?.image_url) {
        try {
          await deleteGalleryImage(image.image_url);
        } catch (storageError) {
          console.warn("Storage deletion failed:", storageError);
          // Continue to delete from database even if storage fails
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", imageId);

      if (error) {
        console.error("Database deletion failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", artisanId] });
      queryClient.invalidateQueries({
        queryKey: ["featured-gallery", artisanId],
      });
      toast({
        title: "Image deleted",
        description:
          "Gallery image has been removed from storage and database.",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting image:", error);
      toast({
        title: "Error deleting image",
        description:
          error?.message || "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({
      imageId,
      isFeatured,
    }: {
      imageId: string;
      isFeatured: boolean;
    }) => {
      const { error } = await supabase
        .from("gallery_images")
        .update({ is_featured: isFeatured })
        .eq("id", imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", artisanId] });
      queryClient.invalidateQueries({
        queryKey: ["featured-gallery", artisanId],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update featured status",
        variant: "destructive",
      });
    },
  });

  const handleToggleFeatured = (imageId: string, currentStatus: boolean) => {
    if (!images) return;

    const featuredCount = images.filter((img) => img.is_featured).length;

    if (!currentStatus && featuredCount >= MAX_FEATURED_IMAGES) {
      toast({
        title: "Featured limit reached",
        description: `You can only feature ${MAX_FEATURED_IMAGES} images. Please unfeature an existing image first.`,
        variant: "destructive",
      });
      return;
    }

    toggleFeatured.mutate({ imageId, isFeatured: !currentStatus });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (dropped.length === 0) return;

    // Start cropping workflow
    setPendingFiles(dropped);
    setTotalFiles(dropped.length);
    setCurrentFileIndex(0);
  }, []);

  const handleCroppedImage = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `gallery-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    const preview = URL.createObjectURL(croppedBlob);

    setSelectedFiles([...selectedFiles, croppedFile]);
    setPreviews([...previews, preview]);

    // Close the crop dialog and let useEffect process the next file
    setCropDialogOpen(false);
  };

  const handleFilePickerClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Start cropping workflow (processNextFile will be triggered by useEffect)
    setPendingFiles(files);
    setTotalFiles(files.length);
    setCurrentFileIndex(0);

    // Reset input
    e.target.value = "";
  };

  const handleRemoveAt = (idx: number) => {
    const nextPreviews = previews.slice();
    const nextFiles = selectedFiles.slice();
    const [removedPreview] = nextPreviews.splice(idx, 1);
    nextFiles.splice(idx, 1);
    if (removedPreview) URL.revokeObjectURL(removedPreview);
    setPreviews(nextPreviews);
    setSelectedFiles(nextFiles);
  };

  const handleUploadConfirm = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Choose one or more images to upload.",
      });
      return;
    }
    setUploading(true);
    try {
      let orderBase = images?.length || 0;
      for (const file of selectedFiles) {
        const url = await uploadGalleryImage(artisanId, file);
        orderBase += 1;
        await supabase.from("gallery_images").insert({
          artisan_id: artisanId,
          image_url: url,
          title: file.name,
          display_order: orderBase,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["gallery", artisanId] });
      toast({
        title: "Upload complete",
        description: `${selectedFiles.length} image(s) added to your gallery.`,
      });
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews([]);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image(s). Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Gallery Images</h3>
        <p className="text-sm text-muted-foreground">
          Supported formats: JPG, PNG, GIF
        </p>
      </div>

      <Input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {previews.length === 0 ? (
        <div
          onClick={handleFilePickerClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
            isDragging && "border-primary/50 bg-primary/5"
          )}
        >
          <div className="rounded-full bg-background p-3 shadow-sm">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to select</p>
            <p className="text-xs text-muted-foreground">
              or drag and drop file here
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((src, idx) => (
              <div
                key={src}
                className="relative group h-48 overflow-hidden rounded-lg border"
              >
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveAt(idx)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={handleFilePickerClick}
              disabled={uploading}
            >
              <UploadIcon className="mr-2 h-4 w-4" /> Add more
            </Button>
            <Button
              onClick={handleUploadConfirm}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <UploadIcon className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Uploading...
                </>
              ) : (
                `Confirm Upload (${selectedFiles.length})`
              )}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <UploadIcon className="h-8 w-8 animate-spin" />
        </div>
      ) : images && images.length > 0 ? (
        <div>
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Star className="inline h-4 w-4 mr-1" />
              Click the star icon to feature up to {MAX_FEATURED_IMAGES} images
              (shown in browse preview)
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className={cn(
                    "w-full aspect-square object-cover rounded-lg",
                    image.is_featured && "ring-2 ring-yellow-500"
                  )}
                  loading="lazy"
                  decoding="async"
                />
                <Button
                  size="icon"
                  variant={image.is_featured ? "default" : "secondary"}
                  className={cn(
                    "absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity",
                    image.is_featured &&
                      "opacity-100 bg-yellow-500 hover:bg-yellow-600"
                  )}
                  onClick={() =>
                    handleToggleFeatured(image.id, image.is_featured)
                  }
                  aria-label={
                    image.is_featured
                      ? `Unfeature ${image.title}`
                      : `Feature ${image.title}`
                  }
                  title={
                    image.is_featured
                      ? "Remove from featured"
                      : "Add to featured"
                  }
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      image.is_featured && "fill-current"
                    )}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteImage.mutate(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <ImageCropDialog
        open={cropDialogOpen}
        imageSrc={currentCropImage}
        aspectRatio={4 / 3}
        onCropComplete={handleCroppedImage}
        onClose={() => setCropDialogOpen(false)}
        title={
          totalFiles > 1
            ? `Crop Image ${currentFileIndex + 1} of ${totalFiles}`
            : "Crop Image"
        }
      />
    </div>
  );
};
