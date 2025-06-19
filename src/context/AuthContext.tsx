import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendVerificationEmail: () => Promise<{ error: any }>;
  updateUsername: (username: string) => Promise<{ error: any }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
      setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
      setLoading(false);
      }
    };
    
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user just signed in, redirect to their last path
      if (session && window.location.pathname === '/login') {
        const savedPath = localStorage.getItem('lastPath');
        if (savedPath) {
          window.location.href = savedPath;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // Get the current origin with the correct port
  const getRedirectOrigin = () => {
    // Use the current window location including the port
    return window.location.origin;
  };

  const signUp = async (email: string, password: string, username: string) => {
    // First, sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${getRedirectOrigin()}/login`,
        data: {
          username
        }
      }
    });
    
    if (error || !data.user) {
      return { error, data: null };
    }
    
    // Create a profile record in the profiles table
    try {
      // We'll use the REST API but with the correct authentication
      // Get the session from the signup response
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      // If we have a session, use it to create the profile
      if (accessToken) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            id: data.user.id,
            username,
            email
          })
        });
        
        if (!response.ok) {
          console.error('Error creating profile:', response.statusText);
          return { error: new Error(`Failed to create profile: ${response.statusText}`), data };
        }
      } else {
        // If we don't have a session, try using a service role key if available
        // Note: This is a fallback and not ideal for production
        console.warn('No session available for profile creation, using anon key as fallback');
        
        // For now, we'll just return success and rely on the database trigger
        // to create the profile when the user is confirmed
      }
      
      return { error: null, data };
    } catch (err) {
      console.error('Error creating profile:', err);
      return { error: err, data };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getRedirectOrigin()}/reset-password`,
    });
    return { error };
  };
  
  const resendVerificationEmail = async () => {
    if (!user?.email) {
      return { error: new Error('No user email found') };
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${getRedirectOrigin()}/login`,
      }
    });
    
    return { error };
  };
  
  const updateUsername = async (username: string) => {
    if (!user) {
      return { error: new Error('No user found') };
    }
    
    try {
      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        return { error: new Error('Not authenticated') };
      }
      
      // First update the user metadata in Supabase Auth
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { username }
      });
      
      if (updateAuthError) {
        return { error: updateAuthError };
      }
      
      // Then update the profiles table
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            username
          })
        }
      );
      
      if (!response.ok) {
        return { error: new Error(`Failed to update username: ${response.statusText}`) };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Error updating username:', err);
      return { error: err };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { error: new Error('No user found') };
    }
    
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        return { error: new Error('Current password is incorrect') };
      }
      
      // If sign in was successful, update the password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      return { error };
    } catch (err) {
      console.error('Error updating password:', err);
      return { error: err };
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendVerificationEmail,
    updateUsername,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 