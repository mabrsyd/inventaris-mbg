/**
 * Users API functions
 * Handles user management operations
 */

import apiClient from './client';
import type { User, ApiResponse, PaginatedResponse } from '../types';

// ===========================
// User Query Parameters
// ===========================

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  isApproved?: boolean;
}

// ===========================
// User API Functions
// ===========================

/**
 * Get all users with pagination
 */
export const fetchUsers = async (params?: UsersQueryParams): Promise<User[]> => {
  try {
    const { data } = await apiClient.get<PaginatedResponse<User>>('/api/users', { params });
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<User>>(`/api/users/${id}`);
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};

/**
 * Create new user
 */
export const createUser = async (userData: Partial<User>): Promise<User | null> => {
  try {
    const { data } = await apiClient.post<ApiResponse<User>>('/api/users', userData);
    return data.data || null;
  } catch (error) {
    console.error('Failed to create user:', error);
    return null;
  }
};

/**
 * Update user
 */
export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const { data } = await apiClient.put<ApiResponse<User>>(`/api/users/${id}`, userData);
    return data.data || null;
  } catch (error) {
    console.error('Failed to update user:', error);
    return null;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/users/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    return false;
  }
};

/**
 * Approve user
 */
export const approveUser = async (id: string): Promise<User | null> => {
  try {
    const { data } = await apiClient.post<ApiResponse<User>>(`/api/users/${id}/approve`);
    return data.data || null;
  } catch (error) {
    console.error('Failed to approve user:', error);
    return null;
  }
};

/**
 * Deactivate user
 */
export const deactivateUser = async (id: string): Promise<User | null> => {
  try {
    const { data } = await apiClient.post<ApiResponse<User>>(`/api/users/${id}/deactivate`);
    return data.data || null;
  } catch (error) {
    console.error('Failed to deactivate user:', error);
    return null;
  }
};