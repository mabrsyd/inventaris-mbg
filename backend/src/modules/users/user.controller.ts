import { Response } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '../../app/http/middlewares';
import { asyncHandler } from '../../core/errors';
import { sendSuccessResponse, sendPaginatedResponse } from '../../app/utils';

const userService = new UserService();

export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.createUser(req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'User berhasil dibuat', 201);
});

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.getUsers(req.query);
  return sendPaginatedResponse(res, result.users, result.total, result.page, result.limit);
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  return sendSuccessResponse(res, result);
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.updateUser(req.params.id, req.body, req.user!.userId);
  return sendSuccessResponse(res, result, 'User berhasil diupdate');
});

export const approveUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.approveUser(req.params.id, req.body.isApproved, req.user!.userId);
  return sendSuccessResponse(res, result, 'Status approval user berhasil diupdate');
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.deleteUser(req.params.id, req.user!.userId);
  return sendSuccessResponse(res, result);
});
