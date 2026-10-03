import React, { createContext, useContext, useState, useEffect } from 'react';
import { insforge, dbService } from '../lib/insforge';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await insforge.auth.getCurrentUser();
        const activeToken = insforge.auth?.tokenManager?.getAccessToken?.() || insforge.auth?.http?.userToken;
        if (activeToken && typeof window !== 'undefined') {
          sessionStorage.setItem('insforge_access_token', activeToken);
        }
        if (data?.user) {
          setUser(data.user);
          await loadUserProfile(data.user.id);
        } else if (data && !error && data.id) {
          setUser(data);
          await loadUserProfile(data.id);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data } = await dbService.getUserProfile(userId);
      if (data) {
        setProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to load profile:', err);
      return null;
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthError(error.message || 'Invalid email or password');
        return { success: false, error };
      }

      const authenticatedUser = data?.user || data;
      const token = data?.accessToken || insforge.auth?.tokenManager?.getAccessToken?.() || insforge.auth?.http?.userToken;
      if (token && typeof window !== 'undefined') {
        sessionStorage.setItem('insforge_access_token', token);
      }
      setUser(authenticatedUser);
      let userProfile = null;
      if (authenticatedUser?.id) {
        userProfile = await loadUserProfile(authenticatedUser.id);
      }
      return { 
        success: true, 
        user: authenticatedUser, 
        profile: userProfile, 
        role: userProfile?.role || 'user' 
      };
    } catch (err) {
      const msg = err.message || 'Login failed';
      setAuthError(msg);
      return { success: false, error: err };
    }
  };

  const signUp = async (email, password, name) => {
    setAuthError(null);
    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name
      });

      if (error) {
        setAuthError(error.message || 'Sign up failed');
        return { success: false, error };
      }

      const newUser = data?.user || data;
      const token = data?.accessToken || insforge.auth?.tokenManager?.getAccessToken?.() || insforge.auth?.http?.userToken;
      if (token && typeof window !== 'undefined') {
        sessionStorage.setItem('insforge_access_token', token);
      }
      if (data?.accessToken) {
        setUser(newUser);
      }

      // Automatically initialize user profile in database
      if (newUser?.id) {
        await dbService.saveUserProfile({
          id: newUser.id,
          email,
          name: name || '',
          gender: 'Unspecified'
        });
        await loadUserProfile(newUser.id);
      }

      return {
        success: true,
        user: newUser,
        requireVerification: data?.requireEmailVerification || false
      };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: err };
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('insforge_access_token');
      }
      await insforge.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (updatedFields) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const res = await dbService.saveUserProfile({
      id: user.id,
      email: user.email,
      ...updatedFields
    });
    if (res.data) {
      setProfile(res.data);
      return { success: true, profile: res.data };
    }
    return { success: false, error: res.error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        isAdmin: profile?.role === 'admin',
        loading,
        authError,
        setAuthError,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile: () => user?.id && loadUserProfile(user.id)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
