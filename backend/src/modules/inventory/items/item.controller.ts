import { Response } from 'express';
import { ItemService } from './item.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const itemService = new ItemService();

export const createItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await itemService.createItem(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Item berhasil dibuat', 201);
});

export const getItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await itemService.getItems(req.query);
  return sendPaginatedResponse(res, result.items, result.total, result.page, result.limit);
});

export const getItemById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await itemService.getItemById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updateItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await itemService.updateItem(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Item berhasil diupdate');
});

export const deleteItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await itemService.deleteItem(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result);
});

export const getItemStockSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await itemService.getItemStockSummary(req.params.id);
  return sendSuccessResponse(res, result);
});
