import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updateProviderProfile,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { isProvider } from '../middleware/roleCheck';
import {
  validate,
  registerValidation,
  loginValidation,
} from '../middleware/validate';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put(
  '/provider-profile',
  authenticate,
  isProvider,
  updateProviderProfile,
);
router.put('/change-password', authenticate, changePassword);

export default router;
