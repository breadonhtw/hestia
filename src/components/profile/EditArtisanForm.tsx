import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditCommunityForm } from "./EditCommunityForm";
import { GalleryManager } from "./GalleryManager";
import { Switch } from "@/components/ui/switch";
import { CRAFT_CATEGORIES } from "@/data/categories";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const contactChannelEnum = z.enum([
  "chat",
  "instagram",
  "website",
  "email",
  "phone",
]);

const artisanSchema = z.object({
  craft_type: z.string().min(1, "Please select a craft type"),
  location: z.string().min(2, "Location required"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .regex(/^@?[A-Za-z0-9._]{1,30}$/, "Invalid Instagram handle")
    .optional()
    .or(z.literal("")),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9+()\-\s]{7,20}$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  accepting_orders: z.boolean().optional(),
  open_for_commissions: z.boolean().optional(),
  // New MVP fields
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()).optional().default([]),
  contact_channel: contactChannelEnum.default("chat"),
  accepting_orders_expires_at: z.string().optional().or(z.literal("")),
});

type ArtisanFormData = z.infer<typeof artisanSchema>;

interface EditArtisanFormProps {
  fullName: string;
  avatarUrl: string | null;
}

export const EditArtisanForm = ({
  fullName,
  avatarUrl,
}: EditArtisanFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: artisan, isLoading } = useQuery({
    queryKey: ["artisan", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase // ✅ Handle errors
        .from("artisans")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching artisan:", error); // ✅ Log errors
        throw error;
      }
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ArtisanFormData>({
    resolver: zodResolver(artisanSchema),
    values: artisan
      ? {
          craft_type: artisan.craft_type,
          location: artisan.location,
          bio: artisan.bio || "",
          instagram: artisan.instagram || "",
          website: artisan.website || "",
          email: (artisan as any).email || "",
          phone: (artisan as any).phone || "",
          accepting_orders: artisan.accepting_orders || false,
          open_for_commissions: artisan.open_for_commissions || false,
          categories: (artisan as any).categories || [],
          tags: (artisan as any).tags || [],
          contact_channel: (artisan as any).contact_channel || "chat",
          accepting_orders_expires_at:
            (artisan as any).accepting_orders_expires_at || "",
        }
      : undefined,
  });

  const updateArtisan = useMutation({
    mutationFn: async (data: ArtisanFormData) => {
      // Transform empty strings to null to avoid database constraint violations
      const normalizeInstagram = (val?: string | null) => {
        if (!val) return null;
        const cleaned = val.replace(/^@/, "").trim();
        return cleaned ? cleaned : null;
      };
      const normalizeUrl = (val?: string | null) => {
        if (!val) return null;
        const trimmed = val.trim();
        if (!trimmed) return null;
        if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
        try {
          const url = new URL(trimmed);
          url.search = ""; // strip query/utm
          return url.toString();
        } catch {
          return trimmed;
        }
      };

      const expiresAt = () => {
        if (!data.accepting_orders) return null;
        if (data.accepting_orders_expires_at)
          return data.accepting_orders_expires_at;
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString();
      };

      const cleanedData: any = {
        ...data,
        instagram: normalizeInstagram(data.instagram),
        website: normalizeUrl(data.website),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        bio: (data.bio ?? "").trim(),
        contact_value: null,
        accepting_orders_expires_at: expiresAt(),
      };

      // Duplicate detection for instagram/phone (warn & block)
      const normalizedInstagram = normalizeInstagram(data.instagram);
      const normalizedPhone = (data as any).phone?.trim() || null;
      if (normalizedInstagram || normalizedPhone) {
        const { data: dupes, error: dupErr } = await supabase
          .from("artisans_public")
          .select("id, username, instagram, phone")
          .or(
            `instagram.eq.${normalizedInstagram ?? ""},phone.eq.${
              normalizedPhone ?? ""
            }`
          );
        if (!dupErr) {
          const conflict = (dupes || []).find(
            (d) => d && d.id !== (artisan as any)?.id
          );
          if (conflict) {
            throw new Error("DUPLICATE_CONTACT");
          }
        }
      }

      let error: any = null;
      if (artisan) {
        const { error: updateError } = await supabase
          .from("artisans")
          .update(cleanedData)
          .eq("user_id", user!.id);
        error = updateError;
      } else {
        const insertPayload = { user_id: user!.id, ...cleanedData };
        const { error: insertError } = await supabase
          .from("artisans")
          .insert(insertPayload);
        error = insertError;
      }

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artisan"] });
      queryClient.invalidateQueries({ queryKey: ["artisan", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["artisans-public"] });
      toast({
        title: "Success!",
        description: "Your artisan profile has been updated successfully.",
      });
    },
    onError: (err: any) => {
      if (err?.message === "DUPLICATE_CONTACT") {
        toast({
          title: "Duplicate contact",
          description:
            "Instagram handle or phone is already used by another profile.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EditCommunityForm displayName={fullName} avatarUrl={avatarUrl} />

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4">Artisan Details</h3>

        <form
          onSubmit={handleSubmit((data) => updateArtisan.mutate(data))}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="craft_type">Craft Type</Label>
              <Select
                onValueChange={(value) => setValue("craft_type", value)}
                value={watch("craft_type")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a craft" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pottery & Ceramics">
                    Pottery & Ceramics
                  </SelectItem>
                  <SelectItem value="Woodworking">Woodworking</SelectItem>
                  <SelectItem value="Textiles & Fiber Arts">
                    Textiles & Fiber Arts
                  </SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                  <SelectItem value="Art & Illustration">
                    Art & Illustration
                  </SelectItem>
                  <SelectItem value="Baked Goods">Baked Goods</SelectItem>
                  <SelectItem value="Plants & Florals">
                    Plants & Florals
                  </SelectItem>
                  <SelectItem value="Home Decor">Home Decor</SelectItem>
                </SelectContent>
              </Select>
              {errors.craft_type && (
                <p className="text-sm text-destructive">
                  {errors.craft_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="ie. Bishan"
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="A brief description of your craft..."
              rows={2}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          {/* Categories (scoped to craft_type) */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between",
                    !watch("categories")?.length && "text-muted-foreground"
                  )}
                >
                  {watch("categories")?.length
                    ? `${watch("categories")?.length} selected`
                    : "Select categories"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {(CRAFT_CATEGORIES[watch("craft_type")] || []).map(
                        (category) => {
                          const selected = (watch("categories") || []).includes(
                            category
                          );
                          return (
                            <CommandItem
                              key={category}
                              onSelect={() => {
                                const current = new Set(
                                  watch("categories") || []
                                );
                                if (current.has(category))
                                  current.delete(category);
                                else current.add(category);
                                setValue("categories", Array.from(current));
                              }}
                            >
                              <span className={cn(selected && "font-medium")}>
                                {category}
                              </span>
                            </CommandItem>
                          );
                        }
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.categories && (
              <p className="text-sm text-destructive">
                {errors.categories.message}
              </p>
            )}
            {/* Selected categories chips */}
            {watch("categories")?.length ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {watch("categories")!.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {cat}
                    <button
                      type="button"
                      aria-label={`Remove ${cat}`}
                      onClick={() => {
                        const next = (watch("categories") || []).filter(
                          (c) => c !== cat
                        );
                        setValue("categories", next);
                      }}
                      className="rounded-md px-1 hover:bg-muted"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {/* Tags (comma separated) */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags/keywords</Label>
            <Input
              id="tags"
              placeholder="e.g. handmade, minimalist, rustic"
              value={(watch("tags") || []).join(", ")}
              onChange={(e) => {
                const tokens = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                setValue("tags", tokens);
              }}
            />
          </div>

          {/* Languages removed per spec */}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...register("instagram")}
                placeholder="@username"
              />
              {errors.instagram && (
                <p className="text-sm text-destructive">
                  {errors.instagram.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <p className="text-sm text-destructive">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email")}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+65 8888 8888"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact method (no extra field) */}
          <div className="space-y-2">
            <Label htmlFor="contact_channel">Preferred Contact</Label>
            <Select
              onValueChange={(value) =>
                setValue("contact_channel", value as any)
              }
              value={watch("contact_channel")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">On-platform chat</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Availability</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="accepting_orders" className="cursor-pointer">
                Accepting Orders
              </Label>
              <Switch
                id="accepting_orders"
                checked={watch("accepting_orders")}
                onCheckedChange={(checked) =>
                  setValue("accepting_orders", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="open_for_commissions" className="cursor-pointer">
                Open for Commissions
              </Label>
              <Switch
                id="open_for_commissions"
                checked={watch("open_for_commissions")}
                onCheckedChange={(checked) =>
                  setValue("open_for_commissions", checked)
                }
              />
            </div>
          </div>

          <Button type="submit" disabled={updateArtisan.isPending}>
            {updateArtisan.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
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
