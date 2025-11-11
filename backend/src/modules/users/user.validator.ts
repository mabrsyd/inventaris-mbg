import { body, query } from 'express-validator';

export const createUserValidator = [
  body('email').isEmail().withMessage('Email harus valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('fullName').notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('role').isIn(['ADMIN', 'WAREHOUSE_STAFF', 'KITCHEN_STAFF', 'DISTRIBUTION_STAFF', 'BENEFICIARY_POINT'])
    .withMessage('Role tidak valid'),
  body('locationId').optional().isString(),
];

export const updateUserValidator = [
  body('fullName').optional().notEmpty(),
  body('role').optional().isIn(['ADMIN', 'WAREHOUSE_STAFF', 'KITCHEN_STAFF', 'DISTRIBUTION_STAFF', 'BENEFICIARY_POINT']),
  body('locationId').optional().isString(),
  body('isActive').optional().isBoolean(),
];

export const approveUserValidator = [
  body('isApproved').isBoolean().withMessage('isApproved harus boolean'),
];

export const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isString(),
  query('locationId').optional().isString(),
  query('isActive').optional().isBoolean(),
  query('isApproved').optional().isBoolean(),
];
