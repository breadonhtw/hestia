import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArtisanOnboardingWizard } from "@/components/artisan/ArtisanOnboardingWizard";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight, Sparkles, Zap, Users, Award } from "lucide-react";

const SettingsBecomeArtisan = () => {
  const navigate = useNavigate();
  const [startOnboarding, setStartOnboarding] = useState(false);

  if (startOnboarding) {
    return (
      <ArtisanOnboardingWizard
        onComplete={() => navigate("/profile")}
        onCancel={() => setStartOnboarding(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          Become an Artisan
        </h1>
        <p className="text-muted-foreground">
          Share your craft with the Hestia community and start connecting with customers
        </p>
      </div>

      {/* Benefits Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Why become an artisan?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Connect with Customers</h3>
              <p className="text-sm text-muted-foreground">
                Reach people in your community who appreciate handmade crafts
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Showcase Your Work</h3>
              <p className="text-sm text-muted-foreground">
                Display your portfolio with a beautiful, dedicated profile
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Earn Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Build your reputation and earn badges as you engage with the community
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Track Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Monitor profile views, favorites, and engagement metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What You'll Need</h2>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Portfolio Images</p>
              <p className="text-sm text-muted-foreground">
                At least 3 high-quality photos showcasing your work (square format recommended)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Craft Information</p>
              <p className="text-sm text-muted-foreground">
                Your craft type, location, and a compelling bio (you can edit these later)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Contact Information</p>
              <p className="text-sm text-muted-foreground">
                At least one contact method (Instagram, WhatsApp, email, etc.)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
        <div className="space-y-3">
          <details className="bg-card border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="flex items-center justify-between font-medium text-foreground hover:text-primary transition-colors">
              Can I edit my profile after publishing?
              <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-sm text-muted-foreground mt-3">
              Yes! You can edit your profile, upload new images, and update your information anytime from your settings.
            </p>
          </details>

          <details className="bg-card border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="flex items-center justify-between font-medium text-foreground hover:text-primary transition-colors">
              How do customers contact me?
              <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-sm text-muted-foreground mt-3">
              Through your preferred contact method (Instagram DM, WhatsApp, email, etc.). Pricing and orders are handled directly between you and customers.
            </p>
          </details>

          <details className="bg-card border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="flex items-center justify-between font-medium text-foreground hover:text-primary transition-colors">
              Is there a fee to become an artisan?
              <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-sm text-muted-foreground mt-3">
              No! It's completely free to list your work on Hestia. We're focused on building a community of makers.
            </p>
          </details>

          <details className="bg-card border border-border rounded-lg p-4 cursor-pointer group">
            <summary className="flex items-center justify-between font-medium text-foreground hover:text-primary transition-colors">
              Can I have multiple profiles?
              <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-sm text-muted-foreground mt-3">
              Each account can have one artisan profile. If you have multiple craft businesses, contact us to discuss options.
            </p>
          </details>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-100 text-sm mb-1">Membership Guidelines</p>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            All artisan profiles must follow our community guidelines. Profiles must showcase handmade or hand-crafted work. Reselling mass-produced items is not permitted.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={() => setStartOnboarding(true)}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Start Creating Your Profile
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/browse")}
        >
          Browse Other Artisans First
        </Button>
      </div>
    </div>
  );
};

export default SettingsBecomeArtisan;
