import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ArtisanProfileDraft {
  id?: string;
  displayName?: string;
  category?: string;
  bio?: string;
  location?: string;
  instagram?: string;
  whatsappUrl?: string;
  telegram?: string;
  externalShopUrl?: string;
  contactChannel?: 'instagram' | 'whatsapp' | 'telegram' | 'email';
  contactValue?: string;
  email?: string;
  phone?: string;
  acceptingOrders?: boolean;
  hours?: any;
  tags?: string[];
  galleryImages?: string[]; // URLs of uploaded images
}

export interface PublishResult {
  success: boolean;
  errors?: string[];
  artisan_id?: string;
}

export function useArtisanUpgrade() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [draftProfile, setDraftProfile] = useState<ArtisanProfileDraft | null>(null);

  /**
   * Create a draft artisan profile for the current user
   */
  const createArtisanProfile = async (): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to upgrade to artisan");
      return null;
    }

    setIsLoading(true);
    try {
      // Call the database function to create artisan profile
      const { data, error } = await supabase.rpc('create_artisan_profile', {
        _user_id: user.id
      });

      if (error) throw error;

      toast.success("Artisan profile created! Complete your profile to get started.");
      return data as string; // Returns the artisan_id
    } catch (error: any) {
      console.error("Error creating artisan profile:", error);
      toast.error(error.message || "Failed to create artisan profile");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load the user's draft artisan profile
   */
  const loadDraftProfile = async (): Promise<ArtisanProfileDraft | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('artisans')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

      if (data) {
        const draft: ArtisanProfileDraft = {
          id: data.id,
          displayName: profile?.full_name || '',
          category: data.craft_type || '',
          bio: data.bio || '',
          location: data.location || '',
          instagram: data.instagram || '',
          whatsappUrl: data.whatsapp_url || '',
          telegram: data.telegram || '',
          externalShopUrl: data.external_shop_url || '',
          contactChannel: data.contact_channel || 'instagram',
          contactValue: data.contact_value || '',
          email: data.email || '',
          phone: data.phone || '',
          acceptingOrders: data.accepting_orders || false,
          hours: data.hours,
          tags: data.tags || [],
          galleryImages: [] // Will be loaded separately
        };
        setDraftProfile(draft);
        return draft;
      }

      return null;
    } catch (error: any) {
      console.error("Error loading draft profile:", error);
      toast.error("Failed to load your profile");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update the draft artisan profile
   */
  const updateDraftProfile = async (
    artisanId: string,
    updates: Partial<ArtisanProfileDraft>
  ): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const dbUpdates: any = {};

      if (updates.category !== undefined) dbUpdates.craft_type = updates.category;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      // Only update if not empty string (to avoid constraint violations)
      if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram || null;
      if (updates.whatsappUrl !== undefined) dbUpdates.whatsapp_url = updates.whatsappUrl || null;
      if (updates.telegram !== undefined) dbUpdates.telegram = updates.telegram || null;
      if (updates.externalShopUrl !== undefined) dbUpdates.external_shop_url = updates.externalShopUrl || null;
      if (updates.contactChannel !== undefined) dbUpdates.contact_channel = updates.contactChannel;
      if (updates.contactValue !== undefined) dbUpdates.contact_value = updates.contactValue || null;
      if (updates.email !== undefined) dbUpdates.email = updates.email || null;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
      if (updates.acceptingOrders !== undefined) dbUpdates.accepting_orders = updates.acceptingOrders;
      if (updates.hours !== undefined) dbUpdates.hours = updates.hours;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('artisans')
        .update(dbUpdates)
        .eq('id', artisanId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setDraftProfile(prev => prev ? { ...prev, ...updates } : null);

      return true;
    } catch (error: any) {
      console.error("Error updating draft profile:", error);
      toast.error("Failed to save changes");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Publish the artisan profile (validates and makes visible)
   */
  const publishArtisanProfile = async (artisanId: string): Promise<PublishResult> => {
    if (!user) {
      return { success: false, errors: ["You must be logged in"] };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('publish_artisan_profile', {
        _artisan_id: artisanId,
        _user_id: user.id
      });

      if (error) throw error;

      const result = data as PublishResult;

      if (result.success) {
        toast.success("Congratulations! Your artisan profile is now live!");
        return result;
      } else {
        toast.error("Please complete all required fields", {
          description: result.errors?.join(", ")
        });
        return result;
      }
    } catch (error: any) {
      console.error("Error publishing artisan profile:", error);
      toast.error(error.message || "Failed to publish profile");
      return { success: false, errors: [error.message] };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unpublish the artisan profile (hide from discovery)
   */
  const unpublishArtisanProfile = async (artisanId: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('unpublish_artisan_profile', {
        _artisan_id: artisanId,
        _user_id: user.id
      });

      if (error) throw error;

      if (data) {
        toast.success("Your profile has been unpublished");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Error unpublishing artisan profile:", error);
      toast.error("Failed to unpublish profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if the user has an artisan profile (draft or published)
   */
  const hasArtisanProfile = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('artisans')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      console.error("Error checking artisan profile:", error);
      return false;
    }
  };

  /**
   * Upload gallery image for artisan profile
   */
  const uploadGalleryImage = async (
    artisanId: string,
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: "File must be an image" };
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { success: false, error: "Image must be less than 5MB" };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${artisanId}/${Date.now()}.${fileExt}`;

      // Upload to gallery-images bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(uploadData.path);

      // Get current image count for display order
      const { count } = await supabase
        .from('gallery_images')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', artisanId);

      // Insert into gallery_images table
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          artisan_id: artisanId,
          image_url: publicUrl,
          title: `Gallery Image ${(count || 0) + 1}`,
          display_order: count || 0
        });

      if (dbError) throw dbError;

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error("Error uploading gallery image:", error);
      return { success: false, error: error.message || "Failed to upload image" };
    }
  };

  /**
   * Load gallery images for artisan profile
   */
  const loadGalleryImages = async (artisanId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('image_url')
        .eq('artisan_id', artisanId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return data?.map(img => img.image_url) || [];
    } catch (error) {
      console.error("Error loading gallery images:", error);
      return [];
    }
  };

  /**
   * Delete gallery image
   */
  const deleteGalleryImage = async (artisanId: string, imageUrl: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Delete from database
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('artisan_id', artisanId)
        .eq('image_url', imageUrl);

      if (error) throw error;

      // Extract path from URL and delete from storage
      const pathMatch = imageUrl.match(/gallery-images\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from('gallery-images')
          .remove([pathMatch[1]]);
      }

      return true;
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      return false;
    }
  };

  return {
    isLoading,
    draftProfile,
    createArtisanProfile,
    loadDraftProfile,
    updateDraftProfile,
    publishArtisanProfile,
    unpublishArtisanProfile,
    hasArtisanProfile,
    uploadGalleryImage,
    loadGalleryImages,
    deleteGalleryImage,
  };
}
