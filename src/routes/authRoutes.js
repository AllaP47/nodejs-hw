import { Router } from 'express';
import { celebrate } from 'celebrate';
import * as authController from '../controllers/authController.js';
import * as authValidation from '../validations/authValidation.js';

const router = Router();

router.post('/auth/register', celebrate(authValidation.registerUserSchema), authController.registerUser);
router.post('/auth/login', celebrate(authValidation.loginUserSchema), authController.loginUser);
router.post('/auth/refresh', authController.refreshUserSession);
router.post('/auth/logout', authController.logoutUser);

export default router;
