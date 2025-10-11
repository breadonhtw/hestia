import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { EditCommunityForm } from '@/components/profile/EditCommunityForm';
import { EditArtisanForm } from '@/components/profile/EditArtisanForm';
import { FavoritesList } from '@/components/profile/FavoritesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'edit');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      return data;
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile || !role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <ProfileHeader
        fullName={profile.full_name}
        username={profile.username}
        avatarUrl={profile.avatar_url}
        role={role}
      />

      <div className="w-full max-w-[1920px]">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
              <TabsTrigger value="favorites">My Favorites</TabsTrigger>
            </TabsList>

          <TabsContent value="edit" className="space-y-6">
            {role === 'artisan' ? (
              <EditArtisanForm
                fullName={profile.full_name}
                avatarUrl={profile.avatar_url}
              />
            ) : (
              <EditCommunityForm
                fullName={profile.full_name}
                avatarUrl={profile.avatar_url}
              />
            )}
          </TabsContent>

            <TabsContent value="favorites">
              <FavoritesList />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
