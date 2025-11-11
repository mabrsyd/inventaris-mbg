import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().withMessage('Email harus valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('fullName').notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('role').optional().isIn(['ADMIN', 'WAREHOUSE_STAFF', 'KITCHEN_STAFF', 'DISTRIBUTION_STAFF', 'BENEFICIARY_POINT'])
    .withMessage('Role tidak valid'),
  body('locationId').optional().isString(),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Email harus valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token wajib diisi'),
];
