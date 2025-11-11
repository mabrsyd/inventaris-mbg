import { body, query } from 'express-validator';

export const createSupplierValidator = [
  body('code').optional().isString(),
  body('name').notEmpty().withMessage('Nama supplier wajib diisi'),
  body('email').optional().isEmail().withMessage('Email tidak valid'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('country').optional().isString(),
];

export const updateSupplierValidator = [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('country').optional().isString(),
  body('verified').optional().isBoolean(),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('isActive').optional().isBoolean(),
];

export const verifySupplierValidator = [
  body('verified').isBoolean().withMessage('verified harus boolean'),
];

export const updateRatingValidator = [
  body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating harus antara 0-5'),
];

export const listSuppliersValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('verified').optional().isBoolean(),
  query('isActive').optional().isBoolean(),
];
