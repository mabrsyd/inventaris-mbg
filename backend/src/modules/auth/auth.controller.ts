import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../app/http/middlewares';
import { asyncHandler } from '../../core/errors';
import { sendSuccessResponse } from '../../app/utils';

const authService = new AuthService();

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.register(req.body);
  return sendSuccessResponse(res, result, 'Registrasi berhasil. Menunggu approval admin', 201);
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.login(req.body);
  return sendSuccessResponse(res, result, 'Login berhasil');
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  return sendSuccessResponse(res, result, 'Token berhasil diperbarui');
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { refreshToken } = req.body;
  const result = await authService.logout(userId, refreshToken);
  return sendSuccessResponse(res, result, 'Logout berhasil');
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const result = await authService.getProfile(userId);
  return sendSuccessResponse(res, result, 'Profil berhasil diambil');
});
