"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomerOrAdmin = exports.isProviderOrAdmin = exports.isAdmin = exports.isProvider = exports.isCustomer = exports.authorize = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, helpers_1.sendError)(res, 'Authentication required', 401);
        }
        if (!roles.includes(req.user.role)) {
            return (0, helpers_1.sendError)(res, 'Access denied. Insufficient permissions', 403);
        }
        next();
    };
};
exports.authorize = authorize;
exports.isCustomer = (0, exports.authorize)(client_1.Role.CUSTOMER);
exports.isProvider = (0, exports.authorize)(client_1.Role.PROVIDER);
exports.isAdmin = (0, exports.authorize)(client_1.Role.ADMIN);
exports.isProviderOrAdmin = (0, exports.authorize)(client_1.Role.PROVIDER, client_1.Role.ADMIN);
exports.isCustomerOrAdmin = (0, exports.authorize)(client_1.Role.CUSTOMER, client_1.Role.ADMIN);
//# sourceMappingURL=roleCheck.js.map