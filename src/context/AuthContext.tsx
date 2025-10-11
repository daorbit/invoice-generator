import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  authProvider?: string;
  isAnonymous: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithAPI: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Hardcoded credentials
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'Admin@1234',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('invoice_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('invoice_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Legacy login with hardcoded credentials (fallback)
  const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Try API login first, fall back to hardcoded credentials
    try {
      const result = await loginWithAPI(emailOrUsername, password);
      if (result.success) {
        return result;
      }
    } catch (error) {
      // API not available, try hardcoded credentials
      console.log('API login failed, trying hardcoded credentials');
    }

    // Fallback to hardcoded credentials
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (emailOrUsername === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      const newUser: User = {
        id: 'admin-001',
        username: VALID_CREDENTIALS.username,
        email: 'admin@example.com',
        displayName: 'Admin',
        isAnonymous: false,
      };
      setUser(newUser);
      localStorage.setItem('invoice_user', JSON.stringify(newUser));
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  // API-based login
  const loginWithAPI = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      
      // Convert API user to local User type
      const newUser: User = {
        id: response.user.id,
        username: response.user.email.split('@')[0], // Use email prefix as username
        email: response.user.email,
        displayName: response.user.displayName,
        avatarUrl: response.user.avatarUrl,
        authProvider: response.user.authProvider,
        isAnonymous: false,
      };
      
      setUser(newUser);
      localStorage.setItem('invoice_user', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  // Register new user
  const register = async (email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.register({ email, password, displayName });
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      
      // Convert API user to local User type
      const newUser: User = {
        id: response.user.id,
        username: response.user.email.split('@')[0],
        email: response.user.email,
        displayName: response.user.displayName,
        avatarUrl: response.user.avatarUrl,
        authProvider: response.user.authProvider,
        isAnonymous: false,
      };
      
      setUser(newUser);
      localStorage.setItem('invoice_user', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      username: 'Guest User',
      isAnonymous: true,
    };
    setUser(guestUser);
    localStorage.setItem('invoice_user', JSON.stringify(guestUser));
  };

  const logout = async (): Promise<void> => {
    try {
      // Try to call API logout if user is authenticated with API
      if (user && !user.isAnonymous && localStorage.getItem('authToken')) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local data
      setUser(null);
      localStorage.removeItem('invoice_user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('invoice_data'); // Clear invoice data on logout
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithAPI,
    register,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
