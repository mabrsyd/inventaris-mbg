import { Request, Response } from 'express';
import { StockService } from './stock.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const stockService = new StockService();

export const getStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await stockService.getStock(req.query);
  return sendPaginatedResponse(res, result.stocks, result.total, result.page, result.limit);
});

export const getStockById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await stockService.getStockById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const getLowStockItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await stockService.getLowStockItems(req.query.locationId as string);
  return sendSuccessResponse(res, items, 'Low stock items retrieved successfully');
});

export const getExpiringStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const expiringStock = await stockService.getExpiringStock(days, req.query.locationId as string);
  return sendSuccessResponse(res, expiringStock, 'Expiring stock retrieved successfully');
});

export const getStockHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const history = await stockService.getStockHistory(req.params.itemId, req.query.locationId as string);
  return sendSuccessResponse(res, history, 'Stock history retrieved successfully');
});

export const adjustStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const adjustment = await stockService.adjustStock(req.body, req.user!.userId);
  return sendSuccessResponse(res, adjustment, 'Stock adjusted successfully');
});
