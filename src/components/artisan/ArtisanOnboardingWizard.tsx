import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  useArtisanUpgrade,
  ArtisanProfileDraft,
} from "@/hooks/useArtisanUpgrade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface ArtisanOnboardingWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const SINGAPORE_LOCATIONS = [
  "Admiralty",
  "Ang Mo Kio",
  "Bedok",
  "Bishan",
  "Boon Lay",
  "Braddell",
  "Bukit Batok",
  "Bukit Gombak",
  "Bukit Merah",
  "Bukit Panjang",
  "Bukit Timah",
  "Bugis",
  "Changi",
  "Chinatown",
  "City Hall",
  "Clarke Quay",
  "Clementi",
  "Commonwealth",
  "Dhoby Ghaut",
  "Dover",
  "Eunos",
  "Geylang",
  "Hillview",
  "Holland Village",
  "Hougang",
  "Jurong East",
  "Jurong West",
  "Katong",
  "Khatib",
  "Kovan",
  "Mandai",
  "Marine Parade",
  "Marina Bay",
  "Novena",
  "Orchard",
  "Outram Park",
  "Pasir Panjang",
  "Pasir Ris",
  "Paya Lebar",
  "Pioneer",
  "Punggol",
  "Queenstown",
  "Raffles Place",
  "Redhill",
  "River Valley",
  "Sembawang",
  "Seletar",
  "Sengkang",
  "Serangoon",
  "Siglap",
  "Tampines",
  "Tanglin",
  "Tanjong Pagar",
  "Telok Blangah",
  "Thomson",
  "Toa Payoh",
  "Tuas",
  "West Coast",
  "Woodlands",
  "Yio Chu Kang",
  "Yishun",
];

export function ArtisanOnboardingWizard({
  onComplete,
  onCancel,
}: ArtisanOnboardingWizardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    isLoading,
    createArtisanProfile,
    loadDraftProfile,
    updateDraftProfile,
    publishArtisanProfile,
    uploadGalleryImage,
    loadGalleryImages,
    deleteGalleryImage,
  } = useArtisanUpgrade();

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [artisanId, setArtisanId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const isInitialized = useRef(false);
  const hasLoadedData = useRef(false);

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  const [formData, setFormData] = useState<ArtisanProfileDraft>({
    displayName: "",
    category: "",
    bio: "",
    location: "",
    instagram: "",
    whatsappUrl: "",
    telegram: "",
    externalShopUrl: "",
    contactChannel: "instagram",
    contactValue: "",
    email: "",
    phone: "",
    acceptingOrders: false,
    tags: [],
    galleryImages: [],
  });

  // Profile data will be initialized through loadDraftProfile function

  // Load existing draft if it exists (but don't create one yet)
  useEffect(() => {
    const initializeProfile = async () => {
      if (!user || isInitialized.current) return;
      isInitialized.current = true;

      // Try to load existing draft (if user has already started onboarding before)
      const existing = await loadDraftProfile();

      if (existing && existing.id) {
        setArtisanId(existing.id);
        setFormData(existing);

        // Load gallery images
        const images = await loadGalleryImages(existing.id);
        setGalleryImages(images);
        hasLoadedData.current = true;
      } else {
        // Don't create artisan record yet - wait until they publish
        hasLoadedData.current = true;
      }
    };

    initializeProfile();
    // Only run once on mount when user is available
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on field changes (debounced)
  // Only auto-save if artisan record exists (i.e., user has uploaded images or saved)
  useEffect(() => {
    // Skip auto-save until:
    // 1. Data has been loaded initially
    // 2. An artisan record exists (created when they upload images or save)
    if (!artisanId || !hasLoadedData.current) return;

    const timeoutId = setTimeout(async () => {
      try {
        const success = await updateDraftProfile(artisanId, formData);
        if (!success) {
          console.warn("Auto-save failed silently");
        }
      } catch (error) {
        console.error("Auto-save error:", error);
        // Don't show toast for auto-save failures to avoid spam
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [formData, artisanId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handlePublish = async () => {
    // If no artisan record exists yet, create it first
    let currentArtisanId = artisanId;

    if (!currentArtisanId) {
      currentArtisanId = await createArtisanProfile();

      if (!currentArtisanId) {
        toast.error("Failed to create artisan profile");
        return;
      }

      setArtisanId(currentArtisanId);

      // Save the form data to the newly created profile
      await updateDraftProfile(currentArtisanId, formData);

      // Upload gallery images if any were selected
      // (This shouldn't happen in practice since images require artisanId,
      // but keeping for safety)
    }

    const result = await publishArtisanProfile(currentArtisanId);

    if (result.success) {
      // Invalidate role and profile queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Your artisan profile is now live!");
      onComplete?.();
      navigate("/profile");
    } else {
      // Show validation errors
      const errors = result.errors || [];
      toast.error("Please complete all required fields", {
        description: errors.join(", "),
      });
    }
  };

  const handleSaveAndExit = async () => {
    // Only save if user has filled out some data
    const hasData =
      formData.displayName ||
      formData.category ||
      formData.bio ||
      formData.location;

    if (hasData) {
      let currentArtisanId = artisanId;

      // Create artisan record if it doesn't exist yet
      if (!currentArtisanId) {
        currentArtisanId = await createArtisanProfile();

        if (!currentArtisanId) {
          toast.error("Failed to save progress");
          return;
        }

        setArtisanId(currentArtisanId);
      }

      await updateDraftProfile(currentArtisanId, formData);
      toast.success("Progress saved");
    }

    onCancel?.();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // If no artisan record exists yet, create it first
    let currentArtisanId = artisanId;

    if (!currentArtisanId) {
      currentArtisanId = await createArtisanProfile();

      if (!currentArtisanId) {
        toast.error("Failed to create artisan profile");
        return;
      }

      setArtisanId(currentArtisanId);

      // Save current form data to the profile
      await updateDraftProfile(currentArtisanId, formData);
      hasLoadedData.current = true;
    }

    setUploadingImage(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadGalleryImage(currentArtisanId, file);

      if (result.success && result.url) {
        setGalleryImages((prev) => [...prev, result.url!]);
        toast.success(`Image ${i + 1} uploaded successfully`);
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    }

    setUploadingImage(false);
    // Reset input
    e.target.value = "";
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!artisanId) return;

    const success = await deleteGalleryImage(artisanId, imageUrl);
    if (success) {
      setGalleryImages((prev) => prev.filter((url) => url !== imageUrl));
      toast.success("Image deleted");
    } else {
      toast.error("Failed to delete image");
    }
  };

  const updateField = (field: keyof ArtisanProfileDraft, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-8 py-16 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
          Become an Artisan
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Share your craft with the Hestia community in Singapore
        </p>
      </section>

      <div className="container mx-auto px-4 lg:px-8 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-xl shadow-soft p-4 md:p-8 lg:p-12 mb-8 space-y-6">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <>
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2">
                    Let's start with the basics
                  </h2>
                  <p className="text-muted-foreground">
                    Tell us about your craft and where you're based
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) =>
                        updateField("displayName", e.target.value)
                      }
                      placeholder="How should we display your name?"
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Primary Craft Type *</Label>
                    <Select
                      selectedKey={formData.category}
                      onSelectionChange={(key) =>
                        updateField("category", key as string)
                      }
                      placeholder="Select your primary craft"
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopover>
                        <SelectListBox>
                          <SelectItem id="Pottery & Ceramics">
                            Pottery & Ceramics
                          </SelectItem>
                          <SelectItem id="Textiles & Fiber Arts">
                            Textiles & Fiber Arts
                          </SelectItem>
                          <SelectItem id="Woodworking">Woodworking</SelectItem>
                          <SelectItem id="Baked Goods & Preserves">
                            Baked Goods & Preserves
                          </SelectItem>
                          <SelectItem id="Jewelry & Accessories">
                            Jewelry & Accessories
                          </SelectItem>
                          <SelectItem id="Art & Illustration">
                            Art & Illustration
                          </SelectItem>
                          <SelectItem id="Plants & Florals">
                            Plants & Florals
                          </SelectItem>
                          <SelectItem id="Home Decor">Home Decor</SelectItem>
                          <SelectItem id="Other">Other</SelectItem>
                        </SelectListBox>
                      </SelectPopover>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bio">
                      Short Bio (100-500 characters) *
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="Tell people about your craft and what makes it special..."
                      maxLength={500}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.bio?.length || 0}/500 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="location">Location (Singapore) *</Label>
                    <Select
                      selectedKey={formData.location}
                      onSelectionChange={(key) =>
                        updateField("location", key as string)
                      }
                      placeholder="Select your neighborhood"
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopover className="max-h-[300px]">
                        <SelectListBox>
                          {SINGAPORE_LOCATIONS.map((loc) => (
                            <SelectItem key={loc} id={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectListBox>
                      </SelectPopover>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Showcase Your Work (formerly Step 3) */}
            {currentStep === 2 && (
              <>
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2">
                    Showcase Your Work
                  </h2>
                  <p className="text-muted-foreground">
                    Upload at least 3 high-quality images of your work
                    (Required)
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Image Grid */}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {galleryImages.map((imageUrl, index) => (
                        <div
                          key={imageUrl}
                          className="relative aspect-square rounded-lg overflow-hidden border group"
                        >
                          <img
                            src={imageUrl}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleDeleteImage(imageUrl)}
                            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {uploadingImage ? (
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                      ) : (
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mb-4">
                        Click to upload or drag and drop
                        <br />
                        Recommended: Square images, min 800x800px, max 5MB
                      </p>
                      <Button
                        variant="outline"
                        disabled={uploadingImage}
                        asChild
                      >
                        <span>
                          {uploadingImage ? "Uploading..." : "Choose Files"}
                        </span>
                      </Button>
                    </label>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>• Currently uploaded: {galleryImages.length} image(s)</p>
                    <p>• Minimum 3 images required to publish</p>
                    <p>
                      • Images will be automatically compressed and optimized
                    </p>
                    <p>• Supported formats: JPG, PNG, WebP</p>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Contact & Links (formerly Step 4) */}
            {currentStep === 3 && (
              <>
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2">
                    Contact & Links
                  </h2>
                  <p className="text-muted-foreground">
                    How should customers reach you? (At least one required)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactChannel">
                      Preferred Contact Method *
                    </Label>
                    <Select
                      selectedKey={formData.contactChannel}
                      onSelectionChange={(key) =>
                        updateField("contactChannel", key as string)
                      }
                    >
                      <SelectTrigger aria-label="Contact method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopover>
                        <SelectListBox>
                          <SelectItem id="instagram">Instagram DM</SelectItem>
                          <SelectItem id="whatsapp">WhatsApp</SelectItem>
                          <SelectItem id="telegram">Telegram</SelectItem>
                          <SelectItem id="email">Email</SelectItem>
                        </SelectListBox>
                      </SelectPopover>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (Singapore)</Label>
                    <Input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+65 9123 4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram Handle</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsappUrl">WhatsApp Business Link</Label>
                    <Input
                      id="whatsappUrl"
                      value={formData.whatsappUrl}
                      onChange={(e) =>
                        updateField("whatsappUrl", e.target.value)
                      }
                      placeholder="https://wa.me/65..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="telegram">Telegram Handle</Label>
                    <Input
                      id="telegram"
                      value={formData.telegram}
                      onChange={(e) => updateField("telegram", e.target.value)}
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <Label htmlFor="externalShopUrl">Personal Website</Label>
                    <Input
                      id="externalShopUrl"
                      value={formData.externalShopUrl}
                      onChange={(e) =>
                        updateField("externalShopUrl", e.target.value)
                      }
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Availability (formerly Step 5) */}
            {currentStep === 4 && (
              <>
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2">
                    Availability
                  </h2>
                  <p className="text-muted-foreground">
                    Let customers know if you're accepting orders
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="acceptingOrders" className="text-base">
                        Currently Accepting Orders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        You can toggle this anytime from your profile
                      </p>
                    </div>
                    <Switch
                      id="acceptingOrders"
                      checked={formData.acceptingOrders}
                      onCheckedChange={(checked) =>
                        updateField("acceptingOrders", checked)
                      }
                    />
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Note:</strong> Pricing
                      is handled directly through chat with customers. We'll add
                      in-app payment options in the future.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Review & Publish (formerly Step 6) */}
            {currentStep === 5 && (
              <>
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2">
                    Review & Publish
                  </h2>
                  <p className="text-muted-foreground">
                    Make sure everything looks good before going live
                  </p>
                </div>

                <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Display Name
                    </p>
                    <p className="text-base">{formData.displayName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p className="text-base">{formData.category || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Bio
                    </p>
                    <p className="text-base">{formData.bio || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Location
                    </p>
                    <p className="text-base">{formData.location || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Gallery Images
                    </p>
                    <p className="text-base">
                      {galleryImages.length} image(s) uploaded
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Accepting Orders
                    </p>
                    <p className="text-base">
                      {formData.acceptingOrders ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    By publishing, your profile will be visible to the Hestia
                    community in Singapore. You can edit your profile or
                    unpublish it at any time from your settings.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleSaveAndExit}
                disabled={isLoading}
              >
                Save & Exit
              </Button>

              {currentStep < 5 ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handlePublish} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Publish Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
