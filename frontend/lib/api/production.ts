/**
 * Production API functions
 * Re-exports from production.service.ts for direct imports
 */

import { recipesApi, workOrdersApi } from './production.service';

export {
  recipesApi,
  workOrdersApi,
  type RecipesQueryParams,
  type CreateRecipeDto,
  type UpdateRecipeDto,
  type WorkOrdersQueryParams,
  type CreateWorkOrderDto,
  type UpdateWorkOrderDto,
} from './production.service';

// Direct exports for component imports
export const createRecipe = recipesApi.create;
export const getRecipeById = recipesApi.getById;
export const updateRecipe = recipesApi.update;
export const deleteRecipe = recipesApi.delete;

export const createWorkOrder = workOrdersApi.create;
export const getWorkOrderById = workOrdersApi.getById;
export const updateWorkOrder = workOrdersApi.update;
export const deleteWorkOrder = workOrdersApi.delete;