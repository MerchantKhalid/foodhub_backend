"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerReviews = exports.deleteReview = exports.updateReview = exports.getMealReviews = exports.createReview = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
const createReview = async (req, res) => {
    try {
        const customerId = req.user.userId;
        const { mealId, orderId, rating, comment } = req.body;
        // Verify order exists and belongs to customer
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                customerId,
                status: 'DELIVERED',
            },
            include: {
                orderItems: true,
            },
        });
        if (!order) {
            return (0, helpers_1.sendError)(res, 'Order not found or not delivered yet', 404);
        }
        // Verify meal was in the order
        const mealInOrder = order.orderItems.some((item) => item.mealId === mealId);
        if (!mealInOrder) {
            return (0, helpers_1.sendError)(res, 'Meal was not part of this order', 400);
        }
        // Check if review already exists
        const existingReview = await prisma.review.findFirst({
            where: {
                customerId,
                mealId,
                orderId,
            },
        });
        if (existingReview) {
            return (0, helpers_1.sendError)(res, 'You have already reviewed this meal for this order', 400);
        }
        const review = await prisma.review.create({
            data: {
                customerId,
                mealId,
                orderId,
                rating,
                comment,
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                meal: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return (0, helpers_1.sendSuccess)(res, review, 'Review submitted successfully', 201);
    }
    catch (error) {
        console.error('Create review error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to submit review', 500);
    }
};
exports.createReview = createReview;
const getMealReviews = async (req, res) => {
    try {
        const { mealId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { mealId },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.review.count({ where: { mealId } }),
        ]);
        return (0, helpers_1.sendPaginatedResponse)(res, reviews, {
            page: Number(page),
            limit: Number(limit),
            total,
        });
    }
    catch (error) {
        console.error('Get meal reviews error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch reviews', 500);
    }
};
exports.getMealReviews = getMealReviews;
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.userId;
        const { rating, comment } = req.body;
        const existingReview = await prisma.review.findFirst({
            where: { id, customerId },
        });
        if (!existingReview) {
            return (0, helpers_1.sendError)(res, 'Review not found', 404);
        }
        const review = await prisma.review.update({
            where: { id },
            data: {
                ...(rating && { rating }),
                ...(comment !== undefined && { comment }),
            },
        });
        return (0, helpers_1.sendSuccess)(res, review, 'Review updated successfully');
    }
    catch (error) {
        console.error('Update review error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to update review', 500);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.userId;
        const existingReview = await prisma.review.findFirst({
            where: { id, customerId },
        });
        if (!existingReview) {
            return (0, helpers_1.sendError)(res, 'Review not found', 404);
        }
        await prisma.review.delete({
            where: { id },
        });
        return (0, helpers_1.sendSuccess)(res, null, 'Review deleted successfully');
    }
    catch (error) {
        console.error('Delete review error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to delete review', 500);
    }
};
exports.deleteReview = deleteReview;
const getCustomerReviews = async (req, res) => {
    try {
        const customerId = req.user.userId;
        const reviews = await prisma.review.findMany({
            where: { customerId },
            include: {
                meal: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        provider: {
                            select: {
                                providerProfile: {
                                    select: {
                                        restaurantName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return (0, helpers_1.sendSuccess)(res, reviews);
    }
    catch (error) {
        console.error('Get customer reviews error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch reviews', 500);
    }
};
exports.getCustomerReviews = getCustomerReviews;
//# sourceMappingURL=reviewController.js.map