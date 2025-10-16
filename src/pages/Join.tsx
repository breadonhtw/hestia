import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Footer } from "@/components/Footer";
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
import { toast } from "sonner";
import { joinFormSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";

const Join = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    craftType: "",
    story: "",
    specialty: "",
    website: "",
    instagram: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = joinFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    // Save application to database
    const { error } = await supabase.from("artisan_applications").insert({
      name: result.data.name,
      email: result.data.email,
      location: result.data.location,
      craft_type: result.data.craftType,
      story: result.data.story,
      specialty: result.data.specialty || null,
      website: result.data.website || null,
      instagram: result.data.instagram || null,
      phone: result.data.phone || null,
    });

    if (error) {
      console.error("Application submission error:", error);
      toast.error("Submission failed", {
        description:
          "Please try again or contact support if the issue persists.",
      });
      return;
    }

    // Data is validated and safe to submit
    toast.success(
      "Application submitted! We'll review it and be in touch within 5 business days."
    );

    // Reset form
    setFormData({
      name: "",
      email: "",
      location: "",
      craftType: "",
      story: "",
      specialty: "",
      website: "",
      instagram: "",
      phone: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-8 py-16 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
            Share Your Craft with the Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join Hestia and connect with people who appreciate handmade
          </p>
        </section>

        {/* Form */}
        <section className="container mx-auto px-4 lg:px-8 pb-24">
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-card rounded-xl shadow-soft p-8 md:p-12 space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="bg-background"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-background"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (City/Neighborhood) *</Label>
              <Input
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Downtown District"
                className="bg-background"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="craftType">Craft Type *</Label>
              <Select
                selectedKey={formData.craftType}
                onSelectionChange={(key) =>
                  setFormData({ ...formData, craftType: key as string })
                }
                isRequired
                placeholder="Select your craft"
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover>
                  <SelectListBox>
                    <SelectItem id="pottery">Pottery & Ceramics</SelectItem>
                    <SelectItem id="textiles">Textiles & Fiber Arts</SelectItem>
                    <SelectItem id="woodwork">Woodworking</SelectItem>
                    <SelectItem id="baked">Baked Goods & Preserves</SelectItem>
                    <SelectItem id="jewelry">Jewelry & Accessories</SelectItem>
                    <SelectItem id="art">Art & Illustration</SelectItem>
                    <SelectItem id="plants">Plants & Florals</SelectItem>
                    <SelectItem id="decor">Home Decor</SelectItem>
                    <SelectItem id="other">Other</SelectItem>
                  </SelectListBox>
                </SelectPopover>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">Your Story (500 characters max) *</Label>
              <Textarea
                id="story"
                name="story"
                required
                value={formData.story}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                placeholder="Tell us about your journey as a maker..."
                className="bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.story.length}/500 characters
              </p>
              {errors.story && (
                <p className="text-sm text-destructive">{errors.story}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">
                What Makes Your Work Special? (300 characters max)
              </Label>
              <Textarea
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                maxLength={300}
                rows={3}
                className="bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.specialty.length}/300 characters
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="bg-background"
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourusername"
                  className="bg-background"
                />
                {errors.instagram && (
                  <p className="text-sm text-destructive">{errors.instagram}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="bg-background"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Apply to Join Hestia
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center pt-4">
              We'll review your application and be in touch within 5 business
              days
            </p>
          </form>
        </section>

        <Footer />
      </div>
    </PageLayout>
  );
};

export default Join;
