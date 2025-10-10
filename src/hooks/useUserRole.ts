import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user } = useAuth();
  
  const { data: role, isLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      return data?.role as 'artisan' | 'community_member' | 'admin' | null;
    }
  });
  
  return { 
    role, 
    isLoading,
    isArtisan: role === 'artisan', 
    isCommunityMember: role === 'community_member',
    isAdmin: role === 'admin'
  };
};
