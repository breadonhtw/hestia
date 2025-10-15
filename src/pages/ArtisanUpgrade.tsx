import { useNavigate } from "react-router-dom";
import { ArtisanOnboardingWizard } from "@/components/artisan/ArtisanOnboardingWizard";
import { PageLayout } from "@/components/PageLayout";

const ArtisanUpgrade = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to the user's profile after successful publish
    navigate("/profile");
  };

  const handleCancel = () => {
    // Navigate back to home or profile
    navigate("/");
  };

  return (
    <PageLayout>
      <ArtisanOnboardingWizard onComplete={handleComplete} onCancel={handleCancel} />
    </PageLayout>
  );
};

export default ArtisanUpgrade;
