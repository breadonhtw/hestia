import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Heart,
} from "lucide-react";

export const BecomeArtisanBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Copy */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Ready to Share Your Craft?
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                  Join Us as an Artisan
                </h2>
                <p className="text-lg text-muted-foreground">
                  If you're a maker or creator, showcase your work and connect with customers who appreciate handmade crafts.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                  <div className="text-2xl font-bold text-primary">125+</div>
                  <p className="text-xs text-muted-foreground">Artisans</p>
                </div>
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                  <div className="text-2xl font-bold text-primary">5K+</div>
                  <p className="text-xs text-muted-foreground">Visitors/Month</p>
                </div>
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <p className="text-xs text-muted-foreground">Free to Join</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={() => navigate("/settings/become-artisan")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Start Your Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/settings/become-artisan")}
                  variant="outline"
                  size="lg"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="space-y-4">
              <div className="flex gap-3 p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                <Users className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Connect with Customers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reach people who love handmade
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Beautiful Portfolio
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Showcase your work professionally
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Track Analytics
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Monitor views, favorites & engagement
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                <Heart className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Build Your Reputation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Earn badges and grow your following
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
