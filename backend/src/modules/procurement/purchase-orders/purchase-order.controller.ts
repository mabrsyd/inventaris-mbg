import { Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const poService = new PurchaseOrderService();

export const createPO = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.createPO(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Purchase Order berhasil dibuat', 201);
});

export const getPOs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.getPOs(req.query);
  return sendPaginatedResponse(res, result.pos, result.total, result.page, result.limit);
});

export const getPOById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.getPOById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updatePO = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.updatePO(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Purchase Order berhasil diupdate');
});

export const submitForApproval = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.submitForApproval(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'PO berhasil disubmit untuk approval');
});

export const approvePO = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.approvePO(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'PO berhasil diapprove');
});

export const confirmPO = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.confirmPO(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'PO berhasil dikonfirmasi');
});

export const markAsShipped = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await poService.markAsShipped(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'PO berhasil ditandai sebagai shipped');
});

export const cancelPO = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const result = await poService.cancelPO(req.params.id, reason, req.user!.userId);
  return sendSuccessResponse(res, result, 'PO berhasil dibatalkan');
});
