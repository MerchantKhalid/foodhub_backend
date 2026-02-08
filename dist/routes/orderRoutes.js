"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', roleCheck_1.isCustomer, (0, validate_1.validate)(validate_1.createOrderValidation), orderController_1.createOrder);
router.get('/', roleCheck_1.isCustomer, orderController_1.getCustomerOrders);
router.get('/:id', orderController_1.getOrderById);
router.patch('/:id/cancel', roleCheck_1.isCustomer, orderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map