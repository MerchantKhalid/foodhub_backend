import { Router } from 'express';
import {
  createMeal,
  updateMeal,
  deleteMeal,
  toggleMealAvailability,
  getProviderMeals,
  getProviderOrders,
  getProviderOrderById,
  updateOrderStatus,
  getProviderStats,
  getProviderReviews,
} from '../controllers/providerController';
import { authenticate } from '../middleware/auth';
import { isProvider } from '../middleware/roleCheck';
import {
  validate,
  createMealValidation,
  updateMealValidation,
  updateOrderStatusValidation,
} from '../middleware/validate';

const router = Router();

// All routes require authentication and provider role
router.use(authenticate, isProvider);

// Menu management
router.get('/meals', getProviderMeals);
router.post('/meals', validate(createMealValidation), createMeal);
router.put('/meals/:id', validate(updateMealValidation), updateMeal);
router.delete('/meals/:id', deleteMeal);
router.patch('/meals/:id/toggle-availability', toggleMealAvailability);

// Order management
router.get('/orders', getProviderOrders);
router.get('/orders/:id', getProviderOrderById);
router.patch(
  '/orders/:id/status',
  validate(updateOrderStatusValidation),
  updateOrderStatus,
);

// Stats and reviews
router.get('/stats', getProviderStats);
router.get('/reviews', getProviderReviews);

export default router;
