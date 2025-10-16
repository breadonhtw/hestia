import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArtisanAnalyticsRealtime, getDateRange } from "@/hooks/useAnalytics";
import { Eye, Heart, Mail, Image as ImageIcon, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsDashboardProps {
  artisanId: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && trend !== 0 && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({ artisanId }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const { data: analytics, isLoading } = useArtisanAnalyticsRealtime(
    artisanId,
    days,
    !!artisanId
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            No analytics data available yet. Start getting profile views to see your stats!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Track your profile performance over the last {days} days
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Profile Views"
          value={analytics.total_profile_views}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
          description="Total times your profile was viewed"
        />
        <StatCard
          title="Unique Visitors"
          value={analytics.total_unique_visitors}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Individual people who viewed your profile"
        />
        <StatCard
          title="Current Favorites"
          value={analytics.current_favorites}
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
          description="Users who favorited your profile"
        />
        <StatCard
          title="Contact Requests"
          value={analytics.total_contact_requests}
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          description="Messages sent to you"
        />
        <StatCard
          title="Gallery Views"
          value={analytics.total_image_views}
          icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
          description="Times your work was viewed"
        />
        <StatCard
          title="Favorites Added"
          value={analytics.total_favorites_added}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="New favorites in this period"
        />
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Insights</CardTitle>
          <CardDescription>
            How visitors interact with your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">View to Contact Rate</span>
              <span className="font-medium">
                {analytics.total_profile_views > 0
                  ? ((analytics.total_contact_requests / analytics.total_profile_views) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((analytics.total_contact_requests / analytics.total_profile_views) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">View to Favorite Rate</span>
              <span className="font-medium">
                {analytics.total_profile_views > 0
                  ? ((analytics.current_favorites / analytics.total_profile_views) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((analytics.current_favorites / analytics.total_profile_views) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gallery Engagement</span>
              <span className="font-medium">
                {analytics.total_profile_views > 0
                  ? ((analytics.total_image_views / analytics.total_profile_views) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-secondary-foreground h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((analytics.total_image_views / analytics.total_profile_views) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Tips to Improve Engagement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {analytics.total_image_views === 0 && (
            <p>• Add high-quality images to your gallery to showcase your work</p>
          )}
          {analytics.total_contact_requests === 0 && (
            <p>• Make sure your contact information is clear and up-to-date</p>
          )}
          {analytics.current_favorites < 5 && (
            <p>• Update your bio to tell your unique story and connect with visitors</p>
          )}
          {analytics.total_profile_views < 10 && (
            <p>• Share your profile on social media to increase visibility</p>
          )}
          {analytics.total_profile_views > 0 && (
            <p>• Keep your profile active by regularly updating your gallery</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
