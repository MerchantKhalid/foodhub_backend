"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNumber = exports.calculateOrderTotal = exports.sendPaginatedResponse = exports.sendError = exports.sendSuccess = exports.sendResponse = void 0;
const sendResponse = (res, statusCode, data) => {
    return res.status(statusCode).json(data);
};
exports.sendResponse = sendResponse;
const sendSuccess = (res, data, message, statusCode = 200) => {
    return (0, exports.sendResponse)(res, statusCode, {
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400) => {
    return (0, exports.sendResponse)(res, statusCode, {
        success: false,
        error: message,
    });
};
exports.sendError = sendError;
const sendPaginatedResponse = (res, data, pagination, message) => {
    return (0, exports.sendResponse)(res, 200, {
        success: true,
        message,
        data,
        pagination: {
            ...pagination,
            totalPages: Math.ceil(pagination.total / pagination.limit),
        },
    });
};
exports.sendPaginatedResponse = sendPaginatedResponse;
const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};
exports.calculateOrderTotal = calculateOrderTotal;
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};
exports.generateOrderNumber = generateOrderNumber;
//# sourceMappingURL=helpers.js.map