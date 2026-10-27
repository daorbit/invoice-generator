import { apiClient, handleApiError } from './client';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google';
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Register new user with email and password
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Login with Google OAuth
   */
  googleAuth: async (data: GoogleAuthRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/google', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current authenticated user info
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Verify if token is still valid
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  },
};
