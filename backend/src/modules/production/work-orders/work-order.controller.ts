import { Response } from 'express';
import { WorkOrderService } from './work-order.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const woService = new WorkOrderService();

export const createWorkOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await woService.createWorkOrder(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Work Order berhasil dibuat', 201);
});

export const getWorkOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await woService.getWorkOrders(req.query);
  return sendPaginatedResponse(res, result.workOrders, result.total, result.page, result.limit);
});

export const getWOById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await woService.getWOById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const startProduction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await woService.startProduction(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'Produksi berhasil dimulai');
});

export const recordOutput = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await woService.recordOutput(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Output produksi berhasil dicatat');
});

export const completeProduction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await woService.completeProduction(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'Produksi berhasil diselesaikan');
});

export const cancelWorkOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const result = await woService.cancelWorkOrder(req.params.id, reason, req.user!.userId);
  return sendSuccessResponse(res, result, 'Work Order berhasil dibatalkan');
});
