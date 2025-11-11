import { Response } from 'express';
import { BeneficiaryService } from './beneficiary.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const beneficiaryService = new BeneficiaryService();

export const createBeneficiary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await beneficiaryService.createBeneficiary(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Penerima manfaat berhasil dibuat', 201);
});

export const getBeneficiaries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await beneficiaryService.getBeneficiaries(req.query);
  return sendPaginatedResponse(res, result.beneficiaries, result.total, result.page, result.limit);
});

export const getBeneficiaryById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await beneficiaryService.getBeneficiaryById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updateBeneficiary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await beneficiaryService.updateBeneficiary(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Penerima manfaat berhasil diperbarui');
});

export const deleteBeneficiary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await beneficiaryService.deleteBeneficiary(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result, 'Penerima manfaat berhasil dihapus');
});
