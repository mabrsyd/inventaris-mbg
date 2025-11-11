import { body, query } from 'express-validator';

export const createCategoryValidator = [
  body('code').notEmpty().withMessage('Kode kategori wajib diisi'),
  body('name').notEmpty().withMessage('Nama kategori wajib diisi'),
  body('description').optional().isString(),
];

export const updateCategoryValidator = [
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('isActive').optional().isBoolean(),
];

export const listCategoriesValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('isActive').optional().isBoolean(),
];
