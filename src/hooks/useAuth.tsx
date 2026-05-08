import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any | null; // Supabase User
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, data: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      if (mounted) setLoading(false);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile({
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        status: data.status,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        skills: [] // Fetch skills from a related table if necessary later
      } as unknown as UserProfile);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Login failed');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    const userProfile = {
      id: profileData.id,
      email: profileData.email,
      fullName: profileData.full_name,
      role: profileData.role,
      status: profileData.status,
      avatarUrl: profileData.avatar_url,
      createdAt: profileData.created_at,
      skills: []
    } as unknown as UserProfile;

    setProfile(userProfile);
    return userProfile;
  };

  const register = async (email: string, password: string, data: Partial<UserProfile>) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed');

    const profileData = {
      id: authData.user.id,
      email: email,
      full_name: data.fullName || '',
      role: data.role || 'student',
      status: 'active'
    };

    const { error: insertError } = await supabase.from('profiles').insert([profileData]);
    if (insertError) throw insertError;

    const userProfile = {
      id: profileData.id,
      email: profileData.email,
      fullName: profileData.full_name,
      role: profileData.role,
      status: profileData.status,
      skills: []
    } as unknown as UserProfile;

    setProfile(userProfile);
    return userProfile;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    const updateData: any = {};
    if (data.fullName) updateData.full_name = data.fullName;
    // Map other fields as necessary

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);
      
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    // Supabase update password requires user to be logged in
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, updateProfile, changePassword }}>
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
