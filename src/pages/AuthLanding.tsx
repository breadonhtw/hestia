import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AuthLanding() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/40 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tl from-accent/30 via-primary/20 to-accent/40 animate-gradient-shift-reverse" />
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-background/40 p-8 shadow-2xl backdrop-blur-2xl md:p-10">
            {/* Logo/Brand */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-serif text-3xl font-bold text-foreground">
                Hestia
              </h1>
              <h2 className="mb-1 text-xl font-semibold text-foreground">
                Discover Local Creators
              </h2>
              <p className="text-sm text-muted-foreground">
                Join our community or explore as a guest
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link to="/signup" className="block">
                <Button className="w-full" size="lg">
                  Sign Up
                </Button>
              </Link>

              <Link to="/login" className="block">
                <Button variant="secondary" className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/40 px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Link to="/" className="block">
                <Button variant="ghost" className="w-full" size="lg">
                  Continue as Guest
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
