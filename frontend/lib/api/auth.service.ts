/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

import apiClient from './client';
import { API_CONFIG } from '@/lib/config/api.config';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
  ApiResponse,
} from '@/lib/types';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );
    return response.data.data;
  },
};
