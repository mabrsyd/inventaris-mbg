/**
 * Users API Service
 * Handles all user management API calls
 */

import apiClient from './client';
import { API_CONFIG } from '@/lib/config/api.config';
import type { ApiResponse, PaginatedResponse, User, UserRole } from '@/lib/types';

// ===========================
// Request/Response Types
// ===========================

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  locationId?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  fullName?: string;
  role?: UserRole;
  locationId?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isApproved?: boolean;
}

// ===========================
// Users API
// ===========================

export const usersApi = {
  /**
   * Get all users with pagination and filters
   */
  getAll: async (params?: UsersQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_CONFIG.ENDPOINTS.USERS,
      { params }
    );
    return response.data;
  },

  /**
   * Get single user by ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      `${API_CONFIG.ENDPOINTS.USERS}/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new user
   */
  create: async (dto: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_CONFIG.ENDPOINTS.USERS,
      dto
    );
    return response.data.data;
  },

  /**
   * Update user
   */
  update: async (id: string, dto: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      `${API_CONFIG.ENDPOINTS.USERS}/${id}`,
      dto
    );
    return response.data.data;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Approve user account
   */
  approve: async (id: string, isApproved: boolean = true): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      `${API_CONFIG.ENDPOINTS.USERS}/${id}/approve`,
      { isApproved }
    );
    return response.data.data;
  },
};
