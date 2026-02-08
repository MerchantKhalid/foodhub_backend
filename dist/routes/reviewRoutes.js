"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Public
router.get('/meal/:mealId', reviewController_1.getMealReviews);
// Protected
router.post('/', auth_1.authenticate, roleCheck_1.isCustomer, (0, validate_1.validate)(validate_1.createReviewValidation), reviewController_1.createReview);
router.get('/my-reviews', auth_1.authenticate, roleCheck_1.isCustomer, reviewController_1.getCustomerReviews);
router.put('/:id', auth_1.authenticate, roleCheck_1.isCustomer, reviewController_1.updateReview);
router.delete('/:id', auth_1.authenticate, roleCheck_1.isCustomer, reviewController_1.deleteReview);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map