import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { ArtisanOnboardingWizard } from "@/components/artisan/ArtisanOnboardingWizard";
import { Loader2 } from "lucide-react";

const ArtisanUpgrade = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();

  // Redirect existing artisans to profile page
  useEffect(() => {
    if (!authLoading && !roleLoading && role === 'artisan') {
      navigate("/profile");
    }
  }, [role, authLoading, roleLoading, navigate]);

  const handleComplete = () => {
    // Navigate to the user's profile after successful publish
    navigate("/profile");
  };

  const handleCancel = () => {
    // Navigate back to home or profile
    navigate("/");
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Don't show header/footer - wizard has its own layout
  return <ArtisanOnboardingWizard onComplete={handleComplete} onCancel={handleCancel} />;
};

export default ArtisanUpgrade;
