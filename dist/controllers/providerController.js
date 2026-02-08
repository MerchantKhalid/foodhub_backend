"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderReviews = exports.getProviderStats = exports.updateOrderStatus = exports.getProviderOrderById = exports.getProviderOrders = exports.getProviderMeals = exports.toggleMealAvailability = exports.deleteMeal = exports.updateMeal = exports.createMeal = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
// Meal Management
const createMeal = async (req, res) => {
    try {
        const providerId = req.user.userId;
        const { categoryId, name, description, price, imageUrl, ingredients, isAvailable = true, dietaryInfo = 'NONE', prepTime = 30, } = req.body;
        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            return (0, helpers_1.sendError)(res, 'Category not found', 404);
        }
        const meal = await prisma.meal.create({
            data: {
                providerId,
                categoryId,
                name,
                description,
                price,
                imageUrl,
                ingredients,
                isAvailable,
                dietaryInfo: dietaryInfo,
                prepTime,
            },
            include: {
                category: true,
            },
        });
        return (0, helpers_1.sendSuccess)(res, meal, 'Meal created successfully', 201);
    }
    catch (error) {
        console.error('Create meal error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to create meal', 500);
    }
};
exports.createMeal = createMeal;
// export const updateMeal = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const providerId = req.user!.userId;
//     const updateData: UpdateMealInput = req.body;
//     // Verify meal belongs to provider
//     const existingMeal = await prisma.meal.findFirst({
//       where: { id, providerId },
//     });
//     if (!existingMeal) {
//       return sendError(res, 'Meal not found or access denied', 404);
//     }
//     // If categoryId is being updated, verify new category exists
//     if (updateData.categoryId) {
//       const category = await prisma.category.findUnique({
//         where: { id: updateData.categoryId },
//       });
//       if (!category) {
//         return sendError(res, 'Category not found', 404);
//       }
//     }
//     const meal = await prisma.meal.update({
//       where: { id },
//       data: {
//         ...updateData,
//         ...(updateData.dietaryInfo && {
//           dietaryInfo: updateData.dietaryInfo as DietaryType,
//         }),
//       },
//       include: {
//         category: true,
//       },
//     });
//     return sendSuccess(res, meal, 'Meal updated successfully');
//   } catch (error) {
//     console.error('Update meal error:', error);
//     return sendError(res, 'Failed to update meal', 500);
//   }
// };
// updateMeal function has been commented out for now.
const updateMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.userId;
        const { name, description, price, imageUrl, ingredients, isAvailable, dietaryInfo, prepTime, categoryId, } = req.body;
        // Verify meal belongs to provider
        const existingMeal = await prisma.meal.findFirst({
            where: { id, providerId },
        });
        if (!existingMeal) {
            return (0, helpers_1.sendError)(res, 'Meal not found or access denied', 404);
        }
        // If categoryId is being updated, verify new category exists
        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                return (0, helpers_1.sendError)(res, 'Category not found', 404);
            }
        }
        const meal = await prisma.meal.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: Number(price) }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(ingredients !== undefined && { ingredients }),
                ...(isAvailable !== undefined && { isAvailable }),
                ...(prepTime !== undefined && { prepTime: Number(prepTime) }),
                ...(categoryId && { categoryId }),
                ...(dietaryInfo && { dietaryInfo: dietaryInfo }),
            },
            include: {
                category: true,
            },
        });
        return (0, helpers_1.sendSuccess)(res, meal, 'Meal updated successfully');
    }
    catch (error) {
        console.error('Update meal error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to update meal', 500);
    }
};
exports.updateMeal = updateMeal;
const deleteMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.userId;
        // Verify meal belongs to provider
        const existingMeal = await prisma.meal.findFirst({
            where: { id, providerId },
        });
        if (!existingMeal) {
            return (0, helpers_1.sendError)(res, 'Meal not found or access denied', 404);
        }
        await prisma.meal.delete({
            where: { id },
        });
        return (0, helpers_1.sendSuccess)(res, null, 'Meal deleted successfully');
    }
    catch (error) {
        console.error('Delete meal error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to delete meal', 500);
    }
};
exports.deleteMeal = deleteMeal;
const toggleMealAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.userId;
        const existingMeal = await prisma.meal.findFirst({
            where: { id, providerId },
        });
        if (!existingMeal) {
            return (0, helpers_1.sendError)(res, 'Meal not found or access denied', 404);
        }
        const meal = await prisma.meal.update({
            where: { id },
            data: { isAvailable: !existingMeal.isAvailable },
        });
        return (0, helpers_1.sendSuccess)(res, meal, `Meal is now ${meal.isAvailable ? 'available' : 'unavailable'}`);
    }
    catch (error) {
        console.error('Toggle meal availability error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to toggle availability', 500);
    }
};
exports.toggleMealAvailability = toggleMealAvailability;
const getProviderMeals = async (req, res) => {
    try {
        const providerId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [meals, total] = await Promise.all([
            prisma.meal.findMany({
                where: { providerId },
                include: {
                    category: true,
                    reviews: {
                        select: { rating: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.meal.count({ where: { providerId } }),
        ]);
        const mealsWithRating = meals.map((meal) => {
            const avgRating = meal.reviews.length > 0
                ? meal.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    meal.reviews.length
                : 0;
            const { reviews, ...mealWithoutReviews } = meal;
            return {
                ...mealWithoutReviews,
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: reviews.length,
            };
        });
        return (0, helpers_1.sendPaginatedResponse)(res, mealsWithRating, {
            page: Number(page),
            limit: Number(limit),
            total,
        });
    }
    catch (error) {
        console.error('Get provider meals error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch meals', 500);
    }
};
exports.getProviderMeals = getProviderMeals;
// Order Management
const getProviderOrders = async (req, res) => {
    try {
        const providerId = req.user.userId;
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { providerId };
        if (status)
            where.status = status;
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                    orderItems: {
                        include: {
                            meal: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.order.count({ where }),
        ]);
        return (0, helpers_1.sendPaginatedResponse)(res, orders, {
            page: Number(page),
            limit: Number(limit),
            total,
        });
    }
    catch (error) {
        console.error('Get provider orders error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch orders', 500);
    }
};
exports.getProviderOrders = getProviderOrders;
const getProviderOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.userId;
        const order = await prisma.order.findFirst({
            where: { id, providerId },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                orderItems: {
                    include: {
                        meal: true,
                    },
                },
            },
        });
        if (!order) {
            return (0, helpers_1.sendError)(res, 'Order not found', 404);
        }
        return (0, helpers_1.sendSuccess)(res, order);
    }
    catch (error) {
        console.error('Get provider order by id error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch order', 500);
    }
};
exports.getProviderOrderById = getProviderOrderById;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const providerId = req.user.userId;
        // Verify order belongs to provider
        const existingOrder = await prisma.order.findFirst({
            where: { id, providerId },
        });
        if (!existingOrder) {
            return (0, helpers_1.sendError)(res, 'Order not found or access denied', 404);
        }
        // Validate status transition
        const validTransitions = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['PREPARING', 'CANCELLED'],
            PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
            OUT_FOR_DELIVERY: ['DELIVERED'],
            DELIVERED: [],
            CANCELLED: [],
        };
        if (!validTransitions[existingOrder.status].includes(status)) {
            return (0, helpers_1.sendError)(res, `Cannot change status from ${existingOrder.status} to ${status}`, 400);
        }
        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                orderItems: {
                    include: {
                        meal: true,
                    },
                },
            },
        });
        return (0, helpers_1.sendSuccess)(res, order, `Order status updated to ${status}`);
    }
    catch (error) {
        console.error('Update order status error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to update order status', 500);
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Statistics
const getProviderStats = async (req, res) => {
    try {
        const providerId = req.user.userId;
        const [totalOrders, pendingOrders, completedOrders, totalRevenue, totalMeals, avgRating, recentOrders, topMeals,] = await Promise.all([
            // Total orders
            prisma.order.count({ where: { providerId } }),
            // Pending orders
            prisma.order.count({
                where: {
                    providerId,
                    status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
                },
            }),
            // Completed orders
            prisma.order.count({ where: { providerId, status: 'DELIVERED' } }),
            // Total revenue
            prisma.order.aggregate({
                where: { providerId, status: 'DELIVERED' },
                _sum: { totalAmount: true },
            }),
            // Total meals
            prisma.meal.count({ where: { providerId } }),
            // Average rating
            prisma.review.aggregate({
                where: { meal: { providerId } },
                _avg: { rating: true },
            }),
            // Recent orders
            prisma.order.findMany({
                where: { providerId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    customer: { select: { name: true } },
                    orderItems: { select: { quantity: true } },
                },
            }),
            // Top selling meals
            prisma.orderItem.groupBy({
                by: ['mealId'],
                where: { order: { providerId, status: 'DELIVERED' } },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5,
            }),
        ]);
        // Get meal details for top meals
        const topMealIds = topMeals.map((m) => m.mealId);
        const mealDetails = await prisma.meal.findMany({
            where: { id: { in: topMealIds } },
            select: { id: true, name: true, imageUrl: true, price: true },
        });
        const topMealsWithDetails = topMeals.map((tm) => ({
            ...mealDetails.find((m) => m.id === tm.mealId),
            totalSold: tm._sum.quantity,
        }));
        return (0, helpers_1.sendSuccess)(res, {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalMeals,
            avgRating: avgRating._avg.rating
                ? Math.round(avgRating._avg.rating * 10) / 10
                : 0,
            recentOrders: recentOrders.map((o) => ({
                ...o,
                itemCount: o.orderItems.reduce((sum, item) => sum + item.quantity, 0),
            })),
            topMeals: topMealsWithDetails,
        });
    }
    catch (error) {
        console.error('Get provider stats error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch statistics', 500);
    }
};
exports.getProviderStats = getProviderStats;
const getProviderReviews = async (req, res) => {
    try {
        const providerId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { meal: { providerId } },
                include: {
                    customer: { select: { id: true, name: true } },
                    meal: { select: { id: true, name: true, imageUrl: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.review.count({ where: { meal: { providerId } } }),
        ]);
        return (0, helpers_1.sendPaginatedResponse)(res, reviews, {
            page: Number(page),
            limit: Number(limit),
            total,
        });
    }
    catch (error) {
        console.error('Get provider reviews error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch reviews', 500);
    }
};
exports.getProviderReviews = getProviderReviews;
//# sourceMappingURL=providerController.js.map