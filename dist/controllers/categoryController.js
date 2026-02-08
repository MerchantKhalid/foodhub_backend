"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.getAllCategories = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { meals: true },
                },
            },
            orderBy: { name: 'asc' },
        });
        return (0, helpers_1.sendSuccess)(res, categories);
    }
    catch (error) {
        console.error('Get all categories error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch categories', 500);
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                meals: {
                    where: { isAvailable: true },
                    take: 10,
                    include: {
                        provider: {
                            select: {
                                providerProfile: {
                                    select: { restaurantName: true },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: { meals: true },
                },
            },
        });
        if (!category) {
            return (0, helpers_1.sendError)(res, 'Category not found', 404);
        }
        return (0, helpers_1.sendSuccess)(res, category);
    }
    catch (error) {
        console.error('Get category by id error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to fetch category', 500);
    }
};
exports.getCategoryById = getCategoryById;
//# sourceMappingURL=categoryController.js.map