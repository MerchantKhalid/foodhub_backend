"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMealsByProvider = exports.getMealById = exports.getAllMeals = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
const getAllMeals = async (req, res) => {
    try {
        const { categoryId, providerId, dietaryInfo, minPrice, maxPrice, search, isAvailable, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        if (providerId)
            where.providerId = providerId;
        if (dietaryInfo)
            where.dietaryInfo = dietaryInfo;
        if (isAvailable !== undefined)
            where.isAvailable = isAvailable === 'true';
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = Number(minPrice);
            if (maxPrice)
                where.price.lte = Number(maxPrice);
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [meals, total] = await Promise.all([
            prisma.meal.findMany({
                where,
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true,
                            providerProfile: {
                                select: {
                                    restaurantName: true,
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    reviews: {
                        select: {
                            rating: true,
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: Number(limit),
            }),
            prisma.meal.count({ where }),
        ]);
        // Calculate average rating for each meal
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
        console.error('Get all meals error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch meals', 500);
    }
};
exports.getAllMeals = getAllMeals;
const getMealById = async (req, res) => {
    try {
        const { id } = req.params;
        const meal = await prisma.meal.findUnique({
            where: { id },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        providerProfile: {
                            select: {
                                restaurantName: true,
                                description: true,
                                address: true,
                                openingHours: true,
                                closingHours: true,
                                imageUrl: true,
                                cuisineType: true,
                            },
                        },
                    },
                },
                category: true,
                reviews: {
                    include: {
                        customer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!meal) {
            return (0, helpers_1.sendError)(res, 'Meal not found', 404);
        }
        const avgRating = meal.reviews.length > 0
            ? meal.reviews.reduce((sum, r) => sum + r.rating, 0) /
                meal.reviews.length
            : 0;
        return (0, helpers_1.sendSuccess)(res, {
            ...meal,
            avgRating: Math.round(avgRating * 10) / 10,
            reviewCount: meal.reviews.length,
        });
    }
    catch (error) {
        console.error('Get meal by id error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch meal', 500);
    }
};
exports.getMealById = getMealById;
const getMealsByProvider = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { isAvailable, categoryId } = req.query;
        const where = { providerId };
        if (isAvailable !== undefined)
            where.isAvailable = isAvailable === 'true';
        if (categoryId)
            where.categoryId = categoryId;
        const meals = await prisma.meal.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
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
        return (0, helpers_1.sendSuccess)(res, mealsWithRating);
    }
    catch (error) {
        console.error('Get meals by provider error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch meals', 500);
    }
};
exports.getMealsByProvider = getMealsByProvider;
//# sourceMappingURL=mealController.js.map