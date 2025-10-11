import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { uploadGalleryImage, deleteGalleryImage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, X, Upload as UploadIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/use-image-upload';
import { cn } from '@/lib/utils';

interface GalleryManagerProps {
  artisanId: string;
}

export const GalleryManager = ({ artisanId }: GalleryManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange: handleImagePreview,
    handleRemove: handlePreviewRemove,
  } = useImageUpload();

  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery', artisanId],
    queryFn: async () => {
      const { data } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('artisan_id', artisanId)
        .order('display_order', { ascending: true });
      return data || [];
    }
  });

  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      const image = images?.find(img => img.id === imageId);
      if (image) {
        await deleteGalleryImage(image.image_url);
      }
      
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', artisanId] });
      toast({
        title: 'Image deleted',
        description: 'Gallery image has been removed.'
      });
    }
  });

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

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/") && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    },
    [fileInputRef],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImagePreview(e);
  };

  const handleUploadConfirm = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadGalleryImage(artisanId, file);
      
      await supabase
        .from('gallery_images')
        .insert({
          artisan_id: artisanId,
          image_url: url,
          title: file.name,
          display_order: (images?.length || 0) + 1
        });
      
      queryClient.invalidateQueries({ queryKey: ['gallery', artisanId] });
      toast({
        title: 'Image uploaded',
        description: 'Image added to your gallery.'
      });
      handlePreviewRemove();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
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
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
            isDragging && "border-primary/50 bg-primary/5",
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
        <div className="relative">
          <div className="group relative h-64 overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleThumbnailClick}
                className="h-9 w-9 p-0"
              >
                <UploadIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handlePreviewRemove}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {fileName && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate">{fileName}</span>
              <button
                onClick={handlePreviewRemove}
                className="ml-auto rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <Button 
            onClick={handleUploadConfirm} 
            disabled={uploading}
            className="w-full mt-4"
          >
            {uploading ? (
              <>
                <UploadIcon className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Confirm Upload'
            )}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <UploadIcon className="h-8 w-8 animate-spin" />
        </div>
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full aspect-square object-cover rounded-lg"
              />
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
      ) : null}
    </div>
  );
};
