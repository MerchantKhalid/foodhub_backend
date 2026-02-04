import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { isCustomer } from '../middleware/roleCheck';
import { validate, createOrderValidation } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post('/', isCustomer, validate(createOrderValidation), createOrder);
router.get('/', isCustomer, getCustomerOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', isCustomer, cancelOrder);

export default router;
