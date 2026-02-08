"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(validate_1.registerValidation), authController_1.register);
router.post('/login', (0, validate_1.validate)(validate_1.loginValidation), authController_1.login);
router.get('/me', auth_1.authenticate, authController_1.getMe);
router.put('/profile', auth_1.authenticate, authController_1.updateProfile);
router.put('/provider-profile', auth_1.authenticate, roleCheck_1.isProvider, authController_1.updateProviderProfile);
router.put('/change-password', auth_1.authenticate, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map