"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, roleCheck_1.isAdmin);
// User management
router.get('/users', adminController_1.getAllUsers);
router.get('/users/:id', adminController_1.getUserById);
router.patch('/users/:id/status', (0, validate_1.validate)(validate_1.updateUserStatusValidation), adminController_1.updateUserStatus);
router.delete('/users/:id', adminController_1.deleteUser);
// Order management
router.get('/orders', adminController_1.getAllOrders);
router.get('/orders/:id', adminController_1.getOrderDetails);
// Category management
router.post('/categories', (0, validate_1.validate)(validate_1.createCategoryValidation), adminController_1.createCategory);
router.put('/categories/:id', adminController_1.updateCategory);
router.delete('/categories/:id', adminController_1.deleteCategory);
// Review moderation
router.get('/reviews', adminController_1.getAllReviews);
router.delete('/reviews/:id', adminController_1.deleteReview);
// Statistics
router.get('/stats', adminController_1.getPlatformStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map