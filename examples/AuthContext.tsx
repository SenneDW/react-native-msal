/**
 * Auth Context
 * 
 * This provides a convenient way to access authentication state throughout your app.
 * Copy this file to: src/context/AuthContext.tsx
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MSALAccount, MSALResult } from 'react-native-msal';
import { 
  initializeMSAL, 
  login, 
  loginSilent, 
  logout, 
  getAccounts 
} from '../services/msalService';

export interface AuthContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  user: MSALAccount | null;
  accessToken: string | null;
  
  // Methods
  login: (scopes?: string[]) => Promise<MSALResult | undefined>;
  logout: () => Promise<boolean>;
  refreshToken: (scopes?: string[]) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MSALAccount | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * Initialize MSAL on app start
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialized = await initializeMSAL();
        setIsInitialized(initialized);
        
        if (initialized) {
          // Check if user is already logged in
          const accounts = await getAccounts();
          if (accounts.length > 0) {
            setUser(accounts[0]);
            console.log('Existing user found:', accounts[0].username);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Handle login
   */
  const handleLogin = async (scopes: string[] = ['user.read']) => {
    setIsLoading(true);
    try {
      const result = await login(scopes);
      if (result) {
        setUser(result.account);
        setAccessToken(result.accessToken);
        return result;
      }
      return undefined;
    } catch (error) {
      console.error('Login error:', error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const success = await logout(user);
        if (success) {
          setUser(null);
          setAccessToken(null);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh access token silently
   */
  const handleRefreshToken = async (scopes: string[] = ['user.read']) => {
    if (!user) {
      console.warn('Cannot refresh token - no user logged in');
      return false;
    }
    
    try {
      const result = await loginSilent(user, scopes);
      if (result) {
        setAccessToken(result.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If silent token refresh fails, user needs to login again
      setAccessToken(null);
      return false;
    }
  };

  const value: AuthContextType = {
    isInitialized,
    isLoading,
    user,
    accessToken,
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
