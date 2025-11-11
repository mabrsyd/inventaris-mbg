import { Response } from 'express';
import { RecipeService } from './recipe.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const recipeService = new RecipeService();

export const createRecipe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await recipeService.createRecipe(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Resep berhasil dibuat', 201);
});

export const getRecipes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await recipeService.getRecipes(req.query);
  return sendPaginatedResponse(res, result.recipes, result.total, result.page, result.limit);
});

export const getRecipeById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await recipeService.getRecipeById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updateRecipe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await recipeService.updateRecipe(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Resep berhasil diupdate');
});

export const deleteRecipe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await recipeService.deleteRecipe(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result);
});
