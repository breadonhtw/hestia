import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditCommunityForm } from './EditCommunityForm';
import { GalleryManager } from './GalleryManager';
import { Switch } from '@/components/ui/switch';

const artisanSchema = z.object({
  craft_type: z.string().min(1, 'Please select a craft type'),
  location: z.string().min(2, 'Location required'),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional().or(z.literal('')),
  story: z.string().max(500, 'Story must be less than 500 characters').optional().or(z.literal('')),
  instagram: z.string().regex(/^@?[A-Za-z0-9._]{1,30}$/, 'Invalid Instagram handle').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  accepting_orders: z.boolean().optional(),
  open_for_commissions: z.boolean().optional()
});

type ArtisanFormData = z.infer<typeof artisanSchema>;

interface EditArtisanFormProps {
  fullName: string;
  avatarUrl: string | null;
}

export const EditArtisanForm = ({ fullName, avatarUrl }: EditArtisanFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: artisan, isLoading } = useQuery({
    queryKey: ['artisan', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('artisans')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ArtisanFormData>({
    resolver: zodResolver(artisanSchema),
    values: artisan ? {
      craft_type: artisan.craft_type,
      location: artisan.location,
      bio: artisan.bio,
      story: artisan.story || '',
      instagram: artisan.instagram || '',
      website: artisan.website || '',
      accepting_orders: artisan.accepting_orders || false,
      open_for_commissions: artisan.open_for_commissions || false
    } : undefined
  });

  const updateArtisan = useMutation({
    mutationFn: async (data: ArtisanFormData) => {
      const { error } = await supabase
        .from('artisans')
        .update(data)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan'] });
      toast({
        title: 'Profile updated',
        description: 'Your artisan profile has been updated successfully.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <EditCommunityForm fullName={fullName} avatarUrl={avatarUrl} />
      
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4">Artisan Details</h3>
        
        <form onSubmit={handleSubmit((data) => updateArtisan.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="craft_type">Craft Type</Label>
              <Select 
                onValueChange={(value) => setValue('craft_type', value)}
                defaultValue={artisan?.craft_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a craft" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pottery">Pottery</SelectItem>
                  <SelectItem value="Woodwork">Woodwork</SelectItem>
                  <SelectItem value="Textiles">Textiles</SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                  <SelectItem value="Painting">Painting</SelectItem>
                  <SelectItem value="Baking">Baking</SelectItem>
                </SelectContent>
              </Select>
              {errors.craft_type && (
                <p className="text-sm text-destructive">{errors.craft_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="ie. Bishan"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="A brief description of your craft..."
              rows={2}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Your Story</Label>
            <Textarea
              id="story"
              {...register('story')}
              placeholder="Tell your story as an artisan..."
              rows={4}
            />
            {errors.story && (
              <p className="text-sm text-destructive">{errors.story.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...register('instagram')}
                placeholder="@username"
              />
              {errors.instagram && (
                <p className="text-sm text-destructive">{errors.instagram.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Availability</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="accepting_orders" className="cursor-pointer">Accepting Orders</Label>
              <Switch
                id="accepting_orders"
                checked={watch('accepting_orders')}
                onCheckedChange={(checked) => setValue('accepting_orders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="open_for_commissions" className="cursor-pointer">Open for Commissions</Label>
              <Switch
                id="open_for_commissions"
                checked={watch('open_for_commissions')}
                onCheckedChange={(checked) => setValue('open_for_commissions', checked)}
              />
            </div>
          </div>

          <Button type="submit" disabled={updateArtisan.isPending}>
            {updateArtisan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Artisan Details
          </Button>
        </form>
      </div>

      {artisan && (
        <div className="border-t pt-8">
          <GalleryManager artisanId={artisan.id} />
        </div>
      )}
    </div>
  );
};
