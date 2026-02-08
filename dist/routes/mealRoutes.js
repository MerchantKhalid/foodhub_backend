"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mealController_1 = require("../controllers/mealController");
const router = (0, express_1.Router)();
router.get('/', mealController_1.getAllMeals);
router.get('/:id', mealController_1.getMealById);
router.get('/provider/:providerId', mealController_1.getMealsByProvider);
exports.default = router;
//# sourceMappingURL=mealRoutes.js.map