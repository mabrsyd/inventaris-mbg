import { Router } from 'express';
import * as authController from './auth.controller';
import { registerValidator, loginValidator, refreshTokenValidator } from './auth.validator';
import { validate } from '../../app/http/middlewares/validate.middleware';
import { authenticate } from '../../app/http/middlewares/auth.middleware';

const router = Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh', refreshTokenValidator, validate, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

export default router;
