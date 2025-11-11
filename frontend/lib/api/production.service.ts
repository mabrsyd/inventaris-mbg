/**
 * Production API Service
 * Handles Recipes and Work Orders
 */

import apiClient from './client';
import { API_CONFIG } from '../config/api.config';
import type {
  Recipe,
  WorkOrder,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// ===========================
// Recipes
// ===========================

export interface RecipesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  outputItemId?: string;
}

export interface CreateRecipeDto {
  code?: string;
  name: string;
  description?: string;
  portionSize: number;
  preparationTime?: number;
  cookingTime?: number;
  instructions?: string;
  nutritionalInfo?: any;
  ingredients: {
    itemId: string;
    quantity: number;
    unit: string;
  }[];
}

export interface UpdateRecipeDto {
  name?: string;
  description?: string;
  portionSize?: number;
  preparationTime?: number;
  cookingTime?: number;
  instructions?: string;
  nutritionalInfo?: any;
  isActive?: boolean;
  ingredients?: {
    itemId: string;
    quantity: number;
    unit: string;
  }[];
}

export const recipesApi = {
  /**
   * Get all recipes with pagination
   */
  async getAll(params?: RecipesQueryParams): Promise<PaginatedResponse<Recipe>> {
    const { data } = await apiClient.get<PaginatedResponse<Recipe>>(
      API_CONFIG.ENDPOINTS.RECIPES,
      { params }
    );
    return data;
  },

  /**
   * Get recipe by ID
   */
  async getById(id: string): Promise<ApiResponse<Recipe>> {
    const { data } = await apiClient.get<ApiResponse<Recipe>>(
      `${API_CONFIG.ENDPOINTS.RECIPES}/${id}`
    );
    return data;
  },

  /**
   * Create new recipe
   */
  async create(dto: CreateRecipeDto): Promise<ApiResponse<Recipe>> {
    const { data } = await apiClient.post<ApiResponse<Recipe>>(
      API_CONFIG.ENDPOINTS.RECIPES,
      dto
    );
    return data;
  },

  /**
   * Update recipe
   */
  async update(id: string, dto: UpdateRecipeDto): Promise<ApiResponse<Recipe>> {
    const { data } = await apiClient.patch<ApiResponse<Recipe>>(
      `${API_CONFIG.ENDPOINTS.RECIPES}/${id}`,
      dto
    );
    return data;
  },

  /**
   * Delete recipe
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `${API_CONFIG.ENDPOINTS.RECIPES}/${id}`
    );
    return data;
  },

  /**
   * Add ingredient to recipe
   */
  async addIngredient(
    id: string,
    ingredientDto: { itemId: string; quantity: number }
  ): Promise<ApiResponse<Recipe>> {
    const { data } = await apiClient.post<ApiResponse<Recipe>>(
      `${API_CONFIG.ENDPOINTS.RECIPES}/${id}/ingredients`,
      ingredientDto
    );
    return data;
  },

  /**
   * Remove ingredient from recipe
   */
  async removeIngredient(id: string, ingredientId: string): Promise<ApiResponse<Recipe>> {
    const { data } = await apiClient.delete<ApiResponse<Recipe>>(
      `${API_CONFIG.ENDPOINTS.RECIPES}/${id}/ingredients/${ingredientId}`
    );
    return data;
  },
};

// ===========================
// Work Orders
// ===========================

export interface WorkOrdersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  recipeId?: string;
}

export interface CreateWorkOrderDto {
  recipeId: string;
  kitchenLocationId: string;
  plannedQuantity: number;
  scheduledDate?: string;
  notes?: string;
}

export interface UpdateWorkOrderDto {
  plannedQuantity?: number;
  scheduledDate?: string;
  notes?: string;
}

export const workOrdersApi = {
  /**
   * Get all work orders with pagination
   */
  async getAll(params?: WorkOrdersQueryParams): Promise<PaginatedResponse<WorkOrder>> {
    const { data } = await apiClient.get<PaginatedResponse<WorkOrder>>(
      API_CONFIG.ENDPOINTS.WORK_ORDERS,
      { params }
    );
    return data;
  },

  /**
   * Get work order by ID
   */
  async getById(id: string): Promise<ApiResponse<WorkOrder>> {
    const { data } = await apiClient.get<ApiResponse<WorkOrder>>(
      `${API_CONFIG.ENDPOINTS.WORK_ORDERS}/${id}`
    );
    return data;
  },

  /**
   * Create new work order
   */
  async create(dto: CreateWorkOrderDto): Promise<ApiResponse<WorkOrder>> {
    const { data } = await apiClient.post<ApiResponse<WorkOrder>>(
      API_CONFIG.ENDPOINTS.WORK_ORDERS,
      dto
    );
    return data;
  },

  /**
   * Update work order
   */
  async update(id: string, dto: UpdateWorkOrderDto): Promise<ApiResponse<WorkOrder>> {
    const { data } = await apiClient.patch<ApiResponse<WorkOrder>>(
      `${API_CONFIG.ENDPOINTS.WORK_ORDERS}/${id}`,
      dto
    );
    return data;
  },

  /**
   * Delete work order
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `${API_CONFIG.ENDPOINTS.WORK_ORDERS}/${id}`
    );
    return data;
  },

  /**
   * Start work order production
   */
  async start(id: string): Promise<ApiResponse<WorkOrder>> {
    const { data } = await apiClient.post<ApiResponse<WorkOrder>>(
      `${API_CONFIG.ENDPOINTS.WORK_ORDERS}/${id}/start`
    );
    return data;
  },

  /**
   * Complete work order
   */
  async complete(id: string, actualQuantity: number): Promise<ApiResponse<WorkOrder>> {
    const { data } = await apiClient.post<ApiResponse<WorkOrder>>(
      `${API_CONFIG.ENDPOINTS.WORK_ORDERS}/${id}/complete`,
      { actualQuantity }
    );
    return data;
  },

  /**
   * Cancel work order
   */
  async cancel(id: string, reason: string): Promise<ApiResponse<WorkOrder>> {
    const { data } = await apiClient.post<ApiResponse<WorkOrder>>(
      `${API_CONFIG.ENDPOINTS.WORK_ORDERS}/${id}/cancel`,
      { reason }
    );
    return data;
  },

  /**
   * Get work order statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }>> {
    const { data } = await apiClient.get(`${API_CONFIG.ENDPOINTS.WORK_ORDERS}/stats`);
    return data;
  },
};

export default {
  recipes: recipesApi,
  workOrders: workOrdersApi,
};
