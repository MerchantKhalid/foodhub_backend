"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all providers
router.get('/', async (req, res) => {
    try {
        const { search, cuisineType, page = 1, limit = 12 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            role: 'PROVIDER',
            status: 'ACTIVE',
            providerProfile: {
                isActive: true,
            },
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                {
                    providerProfile: {
                        restaurantName: { contains: search, mode: 'insensitive' },
                    },
                },
            ];
        }
        if (cuisineType) {
            where.providerProfile = {
                ...where.providerProfile,
                cuisineType: { contains: cuisineType, mode: 'insensitive' },
            };
        }
        const [providers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    providerProfile: true,
                    _count: {
                        select: { meals: { where: { isAvailable: true } } },
                    },
                },
                skip,
                take: Number(limit),
            }),
            prisma.user.count({ where }),
        ]);
        // Calculate average rating for each provider
        const providersWithRating = await Promise.all(providers.map(async (provider) => {
            const avgRating = await prisma.review.aggregate({
                where: { meal: { providerId: provider.id } },
                _avg: { rating: true },
                _count: true,
            });
            return {
                ...provider,
                avgRating: avgRating._avg.rating
                    ? Math.round(avgRating._avg.rating * 10) / 10
                    : 0,
                reviewCount: avgRating._count,
            };
        }));
        return (0, helpers_1.sendPaginatedResponse)(res, providersWithRating, {
            page: Number(page),
            limit: Number(limit),
            total,
        });
    }
    catch (error) {
        console.error('Get providers error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch providers', 500);
    }
});
// Get provider by ID with menu
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await prisma.user.findFirst({
            where: {
                id,
                role: 'PROVIDER',
                status: 'ACTIVE',
            },
            select: {
                id: true,
                name: true,
                providerProfile: true,
                meals: {
                    where: { isAvailable: true },
                    include: {
                        category: true,
                        reviews: {
                            select: { rating: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!provider) {
            return (0, helpers_1.sendError)(res, 'Provider not found', 404);
        }
        // Calculate ratings
        const avgRating = await prisma.review.aggregate({
            where: { meal: { providerId: id } },
            _avg: { rating: true },
            _count: true,
        });
        const mealsWithRating = provider.meals.map((meal) => {
            const mealAvgRating = meal.reviews.length > 0
                ? meal.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    meal.reviews.length
                : 0;
            const { reviews, ...mealWithoutReviews } = meal;
            return {
                ...mealWithoutReviews,
                avgRating: Math.round(mealAvgRating * 10) / 10,
                reviewCount: reviews.length,
            };
        });
        return (0, helpers_1.sendSuccess)(res, {
            ...provider,
            meals: mealsWithRating,
            avgRating: avgRating._avg.rating
                ? Math.round(avgRating._avg.rating * 10) / 10
                : 0,
            reviewCount: avgRating._count,
        });
    }
    catch (error) {
        console.error('Get provider by id error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch provider', 500);
    }
});
exports.default = router;
//# sourceMappingURL=providerPublicRoutes.js.map