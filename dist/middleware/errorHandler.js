"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.AppError = void 0;
const helpers_1 = require("../utils/helpers");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err instanceof AppError) {
        return (0, helpers_1.sendError)(res, err.message, err.statusCode);
    }
    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        if (prismaError.code === 'P2002') {
            return (0, helpers_1.sendError)(res, 'A record with this value already exists', 409);
        }
        if (prismaError.code === 'P2025') {
            return (0, helpers_1.sendError)(res, 'Record not found', 404);
        }
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return (0, helpers_1.sendError)(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
        return (0, helpers_1.sendError)(res, 'Token expired', 401);
    }
    // Default error
    return (0, helpers_1.sendError)(res, 'Internal server error', 500);
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map