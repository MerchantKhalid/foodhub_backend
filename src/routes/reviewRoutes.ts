import { Router } from 'express';
import {
  createReview,
  getMealReviews,
  updateReview,
  deleteReview,
  getCustomerReviews,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { isCustomer } from '../middleware/roleCheck';
import { validate, createReviewValidation } from '../middleware/validate';

const router = Router();

// Public
router.get('/meal/:mealId', getMealReviews);

// Protected
router.post(
  '/',
  authenticate,
  isCustomer,
  validate(createReviewValidation),
  createReview,
);
router.get('/my-reviews', authenticate, isCustomer, getCustomerReviews);
router.put('/:id', authenticate, isCustomer, updateReview);
router.delete('/:id', authenticate, isCustomer, deleteReview);

export default router;
