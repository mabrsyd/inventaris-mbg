import { Response } from 'express';
import { SupplierService } from './supplier.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const supplierService = new SupplierService();

export const createSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await supplierService.createSupplier(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Supplier berhasil dibuat', 201);
});

export const getSuppliers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await supplierService.getSuppliers(req.query);
  return sendPaginatedResponse(res, result.suppliers, result.total, result.page, result.limit);
});

export const getSupplierById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await supplierService.getSupplierById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updateSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await supplierService.updateSupplier(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Supplier berhasil diupdate');
});

export const deleteSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await supplierService.deleteSupplier(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result);
});

export const verifySupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { verified } = req.body;
  const result = await supplierService.verifySupplier(req.params.id, verified, req.user!.userId);
  return sendSuccessResponse(res, result, 'Status verifikasi supplier berhasil diupdate');
});

export const updateSupplierRating = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating } = req.body;
  const result = await supplierService.updateSupplierRating(req.params.id, rating, req.user!.userId);
  return sendSuccessResponse(res, result, 'Rating supplier berhasil diupdate');
});
