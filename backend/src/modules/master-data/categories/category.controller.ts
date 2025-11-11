import { Response } from 'express';
import { CategoryService } from './category.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const categoryService = new CategoryService();

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await categoryService.createCategory(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Kategori berhasil dibuat', 201);
});

export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await categoryService.getCategories(req.query);
  return sendPaginatedResponse(res, result.categories, result.total, result.page, result.limit);
});

export const getCategoryById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await categoryService.getCategoryById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await categoryService.updateCategory(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Kategori berhasil diupdate');
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await categoryService.deleteCategory(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result);
});
