import { Response } from 'express';
import { DeliveryOrderService } from './delivery-order.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const doService = new DeliveryOrderService();

export const createDeliveryOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await doService.createDeliveryOrder(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Delivery Order berhasil dibuat', 201);
});

export const getDeliveryOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await doService.getDeliveryOrders(req.query);
  return sendPaginatedResponse(res, result.deliveryOrders, result.total, result.page, result.limit);
});

export const getDOById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await doService.getDeliveryOrderById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const startDelivery = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await doService.dispatchDeliveryOrder(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'Pengiriman berhasil dimulai');
});

export const confirmDelivery = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await doService.confirmDelivery(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'Pengiriman berhasil dikonfirmasi');
});

export const cancelDeliveryOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const result = await doService.cancelDeliveryOrder(req.params.id, reason, req.user!.userId);
  return sendSuccessResponse(res, result, 'Delivery Order berhasil dibatalkan');
});
