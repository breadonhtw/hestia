import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength, validateUsername } from '@/lib/password-validation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, username: string, role?: 'artisan' | 'community_member') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, username: string, role: 'artisan' | 'community_member' = 'community_member') => {
    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return { 
        error: { 
          message: `Password requirements not met: ${passwordCheck.feedback.join(', ')}` 
        } 
      };
    }

    // Validate username format
    const usernameCheck = validateUsername(username);
    if (!usernameCheck.isValid) {
      return { error: { message: usernameCheck.error } };
    }

    // Check username availability
    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      return { error: { message: 'Username is already taken' } };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          username: username.toLowerCase(),
          role: role
        }
      }
    });
    
    return { error };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    let email = emailOrUsername;

    // Check if input is username (no @ symbol)
    if (!emailOrUsername.includes('@')) {
      // Look up user by username
      const { data, error: lookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', emailOrUsername.toLowerCase())
        .single();

      if (lookupError || !data) {
        return { error: { message: 'Invalid username or password' } };
      }

      // Get the auth user to find their email
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(data.id);
      
      if (userError || !user?.email) {
        return { error: { message: 'Invalid username or password' } };
      }

      email = user.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    return !data && !error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading, checkUsernameAvailability }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
