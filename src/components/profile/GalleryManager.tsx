import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { uploadGalleryImage, deleteGalleryImage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GalleryManagerProps {
  artisanId: string;
}

export const GalleryManager = ({ artisanId }: GalleryManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadGalleryImage(artisanId, file);
        
        await supabase
          .from('gallery_images')
          .insert({
            artisan_id: artisanId,
            image_url: url,
            title: file.name,
            display_order: (images?.length || 0) + 1
          });
      }
      
      queryClient.invalidateQueries({ queryKey: ['gallery', artisanId] });
      toast({
        title: 'Images uploaded',
        description: `${files.length} image(s) added to your gallery.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gallery Images</h3>
        <Label htmlFor="gallery-upload" className="cursor-pointer">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Upload Images</span>
          </div>
          <Input
            id="gallery-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </Label>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
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
      ) : (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No images yet. Upload your first gallery image!</p>
        </div>
      )}
    </div>
  );
};
