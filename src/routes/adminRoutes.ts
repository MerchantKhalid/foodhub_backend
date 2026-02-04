import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllOrders,
  getOrderDetails,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllReviews,
  deleteReview,
  getPlatformStats,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import {
  validate,
  createCategoryValidation,
  updateUserStatusValidation,
} from '../middleware/validate';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch(
  '/users/:id/status',
  validate(updateUserStatusValidation),
  updateUserStatus,
);
router.delete('/users/:id', deleteUser);

// Order management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);

// Category management
router.post('/categories', validate(createCategoryValidation), createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Review moderation
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Statistics
router.get('/stats', getPlatformStats);

export default router;
