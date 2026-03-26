import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
type AppRole = 'citizen' | 'authority' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: {
    id: string;
    full_name: string;
    phone: string | null;
    ward_id: string | null;
    address: string | null;
    authority_id?: string | null;
  } | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState(true);

  const mapDbRole = (dbRole?: string | null): AppRole | null => {
    switch (dbRole) {
      case 'civic_user':
        return 'citizen';
      case 'local_authority':
        return 'authority';
      case 'admin':
        return 'admin';
      default:
        return null;
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, phone, ward_id, authority_id, role')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        setRole(mapDbRole(userData.role));
        setProfile({
          id: userData.id,
          full_name: userData.name ?? '',
          phone: userData.phone ?? null,
          ward_id: userData.ward_id ?? null,
          address: null,
          authority_id: userData.authority_id ?? null,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (!error && data.user) {
      try {
        await supabase
          .from("users")
          .upsert({
            id: data.user.id,
            name: fullName,
            email,
            role: "civic_user",
          }, { onConflict: "id" });
      } catch (err) {
        console.warn("Failed to create user profile:", err);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
