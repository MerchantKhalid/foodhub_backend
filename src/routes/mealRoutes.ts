import { Router } from 'express';
import {
  getAllMeals,
  getMealById,
  getMealsByProvider,
} from '../controllers/mealController';

const router = Router();

router.get('/', getAllMeals);
router.get('/:id', getMealById);
router.get('/provider/:providerId', getMealsByProvider);

export default router;
