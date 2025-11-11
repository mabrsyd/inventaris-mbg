import { Response } from 'express';
import { LocationService } from './location.service';
import { AuthRequest } from '../../../app/http/middlewares';
import { asyncHandler } from '../../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../../app/utils';

const locationService = new LocationService();

export const createLocation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await locationService.createLocation(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Lokasi berhasil dibuat', 201);
});

export const getLocations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await locationService.getLocations(req.query);
  return sendPaginatedResponse(res, result.locations, result.total, result.page, result.limit);
});

export const getLocationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await locationService.getLocationById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updateLocation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await locationService.updateLocation(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'Lokasi berhasil diupdate');
});

export const deleteLocation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await locationService.deleteLocation(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result);
});
