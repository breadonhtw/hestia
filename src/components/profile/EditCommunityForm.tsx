import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadAvatar } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const communitySchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z
    .string()
    .max(200, "Bio must be less than 200 characters")
    .optional()
    .or(z.literal("")),
});

type CommunityFormData = z.infer<typeof communitySchema>;

interface EditCommunityFormProps {
  displayName: string;
  avatarUrl: string | null;
}

export const EditCommunityForm = ({
  displayName,
  avatarUrl,
}: EditCommunityFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      full_name: displayName,
      bio: "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: CommunityFormData) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
        })
        .eq("id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(user.id, file);

      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);

      setPreviewUrl(url);
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Become an Artisan CTA */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl font-serif">
              Become an Artisan
            </CardTitle>
          </div>
          <CardDescription>
            Share your handcrafted work with the Hestia community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            List your products, connect with customers, and grow your craft
            business. Create your artisan profile in just a few minutes.
          </p>
          <Button
            onClick={() => navigate("/become-artisan")}
            className="w-full sm:w-auto"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Community Profile Form */}
      <form
        onSubmit={handleSubmit((data) => updateProfile.mutate(data))}
        className="space-y-6"
      >
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={previewUrl || ""} alt={displayName} />
            <AvatarFallback className="text-2xl">
              {displayName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>Upload Avatar</span>
              </div>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </Label>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG or GIF (max. 5MB)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Display Name</Label>
          <Input
            id="full_name"
            {...register("full_name")}
            placeholder="Your display name"
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Tell us a bit about yourself..."
            rows={3}
          />
          {errors.bio && (
            <p className="text-sm text-destructive">{errors.bio.message}</p>
          )}
        </div>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </form>
    </div>
  );
};
