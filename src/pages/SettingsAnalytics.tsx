import { useAuth } from "@/contexts/AuthContext";
import { useArtisanByUserId } from "@/hooks/useArtisans";
import { AnalyticsDashboard } from "@/components/artisan/AnalyticsDashboard";
import { Loader2 } from "lucide-react";

const SettingsAnalytics = () => {
  const { user } = useAuth();
  const { data: artisanData, isLoading } = useArtisanByUserId(user?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!artisanData?.id) {
    return (
      <div className="py-12">
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <h3 className="text-xl font-semibold mb-2">Analytics Not Available</h3>
          <p className="text-muted-foreground">
            Analytics are only available for artisan accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Track your profile performance and engagement metrics
        </p>
      </div>

      <AnalyticsDashboard artisanId={artisanData.id} />
    </div>
  );
};

export default SettingsAnalytics;
