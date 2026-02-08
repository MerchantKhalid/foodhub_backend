"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const providerController_1 = require("../controllers/providerController");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication and provider role
router.use(auth_1.authenticate, roleCheck_1.isProvider);
// Menu management
router.get('/meals', providerController_1.getProviderMeals);
router.post('/meals', (0, validate_1.validate)(validate_1.createMealValidation), providerController_1.createMeal);
router.put('/meals/:id', (0, validate_1.validate)(validate_1.updateMealValidation), providerController_1.updateMeal);
router.delete('/meals/:id', providerController_1.deleteMeal);
router.patch('/meals/:id/toggle-availability', providerController_1.toggleMealAvailability);
// Order management
router.get('/orders', providerController_1.getProviderOrders);
router.get('/orders/:id', providerController_1.getProviderOrderById);
router.patch('/orders/:id/status', (0, validate_1.validate)(validate_1.updateOrderStatusValidation), providerController_1.updateOrderStatus);
// Stats and reviews
router.get('/stats', providerController_1.getProviderStats);
router.get('/reviews', providerController_1.getProviderReviews);
exports.default = router;
//# sourceMappingURL=providerRoutes.js.map