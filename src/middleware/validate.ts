import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body } from 'express-validator';
import { sendError } from '../utils/helpers';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map((error: any) => error.msg);
    return sendError(res, errorMessages.join(', '), 400);
  };
};

// Validation schemas
export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role')
    .isIn(['CUSTOMER', 'PROVIDER'])
    .withMessage('Role must be CUSTOMER or PROVIDER'),
  body('restaurantName')
    .if(body('role').equals('PROVIDER'))
    .notEmpty()
    .withMessage('Restaurant name is required for providers'),
  body('restaurantAddress')
    .if(body('role').equals('PROVIDER'))
    .notEmpty()
    .withMessage('Restaurant address is required for providers'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createMealValidation = [
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('name').notEmpty().withMessage('Meal name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
];

export const updateMealValidation = [
  body('name').optional().notEmpty().withMessage('Meal name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
];

export const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.mealId').notEmpty().withMessage('Meal ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('deliveryAddress')
    .notEmpty()
    .withMessage('Delivery address is required'),
  body('contactPhone').notEmpty().withMessage('Contact phone is required'),
];

export const updateOrderStatusValidation = [
  body('status')
    .isIn([
      'CONFIRMED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ])
    .withMessage('Invalid order status'),
];

export const createReviewValidation = [
  body('mealId').notEmpty().withMessage('Meal ID is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

export const createCategoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
];

export const updateUserStatusValidation = [
  body('status')
    .isIn(['ACTIVE', 'SUSPENDED'])
    .withMessage('Status must be ACTIVE or SUSPENDED'),
];
