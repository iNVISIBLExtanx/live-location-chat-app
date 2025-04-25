import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // Get the user profile
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no results

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }
    
    // If user profile exists, set it
    if (data) {
      console.log('User profile found:', data);
      setUser(data as User);
    } else {
      console.warn('User authenticated but no profile found. Creating profile automatically.');
      
      // Get user email from session
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Create a basic profile for the authenticated user
        const newUser: User = {
          id: userId,
          email: authUser.email || 'unknown@example.com',
          full_name: authUser.email ? authUser.email.split('@')[0] : 'User',
          role: 'passenger', // Default role
          created_at: new Date().toISOString(),
        };
        
        // Simpler alternative to bypass RLS issues - The client with AUTH headers should be able to 
        // insert their own user record if the RLS policy is set correctly
        console.log('Attempting to create new user profile with ID matching auth.uid()');
        
        // Try regular insert first
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            ...newUser,
            // Ensure ID matches the authenticated user ID exactly
            id: userId
          });
          
        // If that fails due to RLS, log the complete error for debugging
        if (insertError) {
          console.log('Full insert error details:', JSON.stringify(insertError));
        }
        
        // Only log the error but still set the user object in memory
        // This allows the app to function even if the database insert fails
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          
          // Set the user in memory anyway so the app can function
          console.log('Setting user in memory despite database error');
          setUser(newUser);
        } else {
          console.log('Successfully created user profile');
          setUser(newUser);
        }
      }
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<User>) => {
    // First sign up the user with Supabase Auth
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    
    // If signup is successful, create the user profile
    if (!error && data.user) {
      // Get any existing session to ensure RLS policies work correctly
      await supabase.auth.getSession();
      
      // Prepare user data with required fields
      const newUser = {
        id: data.user.id,
        email,
        full_name: userData?.full_name || email.split('@')[0],
        role: userData?.role || 'passenger',
        avatar_url: userData?.avatar_url || null,
        created_at: new Date().toISOString(),
      };
      
      // Insert the user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert(newUser, { onConflict: 'id' });
      
      if (profileError) {
        console.error('Error creating user profile during signup:', profileError);
        // Note: We're not returning this error to avoid confusing the user
        // The auth account is created, but profile creation failed
      } else {
        console.log('User profile created successfully');
        setUser(newUser as User);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ...updates });
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
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
