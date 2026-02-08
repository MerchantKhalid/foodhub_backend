"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatusValidation = exports.createCategoryValidation = exports.createReviewValidation = exports.updateOrderStatusValidation = exports.createOrderValidation = exports.updateMealValidation = exports.createMealValidation = exports.loginValidation = exports.registerValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const helpers_1 = require("../utils/helpers");
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errorMessages = errors.array().map((error) => error.msg);
        return (0, helpers_1.sendError)(res, errorMessages.join(', '), 400);
    };
};
exports.validate = validate;
// Validation schemas
exports.registerValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('role')
        .isIn(['CUSTOMER', 'PROVIDER'])
        .withMessage('Role must be CUSTOMER or PROVIDER'),
    (0, express_validator_1.body)('restaurantName')
        .if((0, express_validator_1.body)('role').equals('PROVIDER'))
        .notEmpty()
        .withMessage('Restaurant name is required for providers'),
    (0, express_validator_1.body)('restaurantAddress')
        .if((0, express_validator_1.body)('role').equals('PROVIDER'))
        .notEmpty()
        .withMessage('Restaurant address is required for providers'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
exports.createMealValidation = [
    (0, express_validator_1.body)('categoryId').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Meal name is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number'),
];
exports.updateMealValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Meal name cannot be empty'),
    (0, express_validator_1.body)('price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number'),
];
exports.createOrderValidation = [
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    (0, express_validator_1.body)('items.*.mealId').notEmpty().withMessage('Meal ID is required'),
    (0, express_validator_1.body)('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('deliveryAddress')
        .notEmpty()
        .withMessage('Delivery address is required'),
    (0, express_validator_1.body)('contactPhone').notEmpty().withMessage('Contact phone is required'),
];
exports.updateOrderStatusValidation = [
    (0, express_validator_1.body)('status')
        .isIn([
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
    ])
        .withMessage('Invalid order status'),
];
exports.createReviewValidation = [
    (0, express_validator_1.body)('mealId').notEmpty().withMessage('Meal ID is required'),
    (0, express_validator_1.body)('orderId').notEmpty().withMessage('Order ID is required'),
    (0, express_validator_1.body)('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
];
exports.createCategoryValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Category name is required'),
];
exports.updateUserStatusValidation = [
    (0, express_validator_1.body)('status')
        .isIn(['ACTIVE', 'SUSPENDED'])
        .withMessage('Status must be ACTIVE or SUSPENDED'),
];
//# sourceMappingURL=validate.js.map