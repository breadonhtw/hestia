import { useState } from "react";
import { UserPlus, Lock, Mail, User, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/hooks/use-toast-modern";
import { validatePasswordStrength, validateUsername } from "@/lib/password-validation";

interface SignUpCardProps {
  onFlipToSignIn: () => void;
}

export const SignUpCard = ({ onFlipToSignIn }: SignUpCardProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const { signUp, checkUsernameAvailability } = useAuth();

  const passwordStrength = validatePasswordStrength(password);
  const usernameValidation = validateUsername(username);

  const handleSignUp = async () => {
    // Validation
    if (!email || !username || !fullName || !password) {
      showToast({
        title: "Missing Information",
        message: "Please fill in all required fields.",
        variant: "warning",
        position: "bottom-right",
        duration: 4000,
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        variant: "error",
        position: "bottom-right",
        duration: 4000,
      });
      return;
    }

    if (!usernameValidation.isValid) {
      showToast({
        title: "Invalid Username",
        message: usernameValidation.error,
        variant: "error",
        position: "bottom-right",
        duration: 4000,
      });
      return;
    }

    if (!passwordStrength.isValid) {
      showToast({
        title: "Weak Password",
        message: passwordStrength.feedback.join(", "),
        variant: "error",
        position: "bottom-right",
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, fullName, username, 'community_member');

    if (error) {
      showToast({
        title: "Sign Up Failed",
        message: error.message,
        variant: "error",
        position: "bottom-right",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    showToast({
      title: "Welcome to Hestia!",
      message: "Please check your email to verify your account.",
      variant: "success",
      position: "bottom-right",
      duration: 5000,
      highlightTitle: true,
    });
    
    setIsLoading(false);
    setTimeout(() => onFlipToSignIn(), 2000);
  };

  const handleUsernameBlur = async () => {
    if (username && usernameValidation.isValid) {
      const isAvailable = await checkUsernameAvailability(username);
      setIsUsernameAvailable(isAvailable);
      
      if (!isAvailable) {
        showToast({
          title: "Username Taken",
          message: "This username is already in use. Please choose another.",
          variant: "warning",
          position: "bottom-right",
          duration: 4000,
        });
      }
    }
  };

  return (
    <div className="w-full max-w-sm bg-gradient-to-b from-accent/30 via-background to-background rounded-3xl shadow-xl p-8 flex flex-col items-center border border-primary/20 backdrop-blur-sm">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-background mb-6 shadow-lg border border-primary/30">
        <UserPlus className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-2xl font-serif font-semibold mb-2 text-center text-foreground">
        Join Hestia
      </h2>
      <p className="text-muted-foreground text-sm mb-6 text-center">
        Discover amazing artisans and handcrafted goods
      </p>

      <div className="w-full flex flex-col gap-3 mb-2">
        {/* Display Name */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User className="w-4 h-4" />
          </span>
          <input
            placeholder="Display Name"
            type="text"
            value={fullName}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm"
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="w-4 h-4" />
          </span>
          <input
            placeholder="Email"
            type="email"
            value={email}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm"
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Username */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User className="w-4 h-4" />
          </span>
          <input
            placeholder="Username"
            type="text"
            value={username}
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm"
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            onBlur={handleUsernameBlur}
            disabled={isLoading}
          />
          {username && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameValidation.isValid && isUsernameAvailable !== false ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
            </span>
          )}
        </div>

        {/* Password */}
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
            onFocus={() => setShowPasswordReqs(true)}
            onBlur={() => setShowPasswordReqs(false)}
            disabled={isLoading}
          />
        </div>

        {/* Password Requirements */}
        {showPasswordReqs && (
          <div className="text-xs space-y-1 p-3 rounded-lg bg-muted/50">
            {passwordStrength.feedback.length > 0 ? (
              passwordStrength.feedback.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="w-3 h-3 text-destructive" />
                  <span>{req}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>Strong password!</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSignUp}
        disabled={isLoading || (username && isUsernameAvailable === false)}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 mt-2 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="mt-6 text-center space-y-2">
        <button
          onClick={onFlipToSignIn}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Already have an account? Sign in
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
