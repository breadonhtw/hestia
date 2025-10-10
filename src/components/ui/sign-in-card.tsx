import { useState } from "react";
import { LogIn, Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/hooks/use-toast-modern";
import { supabase } from "@/integrations/supabase/client";

interface SignInCardProps {
  onFlipToSignUp: () => void;
}

export const SignInCard = ({ onFlipToSignUp }: SignInCardProps) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!emailOrUsername || !password) {
      showToast({
        title: "Missing Information",
        message: "Please enter both email/username and password.",
        variant: "warning",
        position: "bottom-right",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(emailOrUsername, password);

    if (error) {
      showToast({
        title: "Sign In Failed",
        message: error.message || "Invalid credentials. Please try again.",
        variant: "error",
        position: "bottom-right",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    showToast({
      title: "Welcome to Hestia!",
      message: "You've successfully signed in.",
      variant: "success",
      position: "bottom-right",
      duration: 3000,
      highlightTitle: true,
    });
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      showToast({
        title: "Google Sign In Failed",
        message: error.message,
        variant: "error",
        position: "bottom-right",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-gradient-to-b from-primary/5 via-background to-background rounded-3xl shadow-xl p-8 flex flex-col items-center border border-primary/20 backdrop-blur-sm">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-background mb-6 shadow-lg border border-primary/30">
        <LogIn className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-2xl font-serif font-semibold mb-2 text-center text-foreground">
        Sign in to Hestia
      </h2>
      <p className="text-muted-foreground text-sm mb-6 text-center">
        Connect with local artisans and makers
      </p>
      <div className="w-full flex flex-col gap-3 mb-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="w-4 h-4" />
          </span>
          <input
            placeholder="Email or Username"
            type="text"
            value={emailOrUsername}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm"
            onChange={(e) => setEmailOrUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            disabled={isLoading}
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-4 h-4" />
          </span>
          <input
            placeholder="Password"
            type="password"
            value={password}
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            disabled={isLoading}
          />
        </div>
        <div className="w-full flex justify-end">
          <button className="text-xs hover:underline font-medium text-muted-foreground">
            Forgot password?
          </button>
        </div>
      </div>
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 mt-2 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Get Started"
        )}
      </button>
      <div className="flex items-center w-full my-2">
        <div className="flex-grow border-t border-dashed border-border"></div>
        <span className="mx-2 text-xs text-muted-foreground">Or sign in with</span>
        <div className="flex-grow border-t border-dashed border-border"></div>
      </div>
      <div className="flex gap-3 w-full justify-center mt-2">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-background hover:bg-accent transition grow disabled:opacity-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
        </button>
        <button
          disabled
          className="flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-background hover:bg-accent transition grow opacity-50 cursor-not-allowed"
          title="Coming soon"
        >
          <img
            src="https://www.svgrepo.com/show/448224/facebook.svg"
            alt="Facebook"
            className="w-6 h-6"
          />
        </button>
        <button
          disabled
          className="flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-background hover:bg-accent transition grow opacity-50 cursor-not-allowed"
          title="Coming soon"
        >
          <img
            src="https://www.svgrepo.com/show/511330/apple-173.svg"
            alt="Apple"
            className="w-6 h-6"
          />
        </button>
      </div>
      <div className="mt-6 text-center space-y-2">
        <button
          onClick={onFlipToSignUp}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Don't have an account? Sign up →
        </button>
        <div>
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Continue as Guest →
          </a>
        </div>
      </div>
    </div>
  );
};
