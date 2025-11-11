import { Response } from 'express';
import { GoodsReceiptService } from './goods-receipt.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const grService = new GoodsReceiptService();

export const createGoodsReceipt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await grService.createGoodsReceipt(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Goods Receipt berhasil dibuat', 201);
});

export const getGoodsReceipts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await grService.getGoodsReceipts(req.query);
  return sendPaginatedResponse(res, result.receipts, result.total, result.page, result.limit);
});

export const getGRById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await grService.getGRById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const performQC = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await grService.performQC(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'QC berhasil dilakukan');
});

export const updateQCStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await grService.updateQCStatus(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'QC status berhasil diperbarui');
});
