import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/helpers';

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { meals: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, categories);
  } catch (error) {
    console.error('Get all categories error:', error);
    return sendError(res, 'Failed to fetch categories', 500);
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
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
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, category);
  } catch (error) {
    console.error('Get category by id error:', error);
    return sendError(res, 'Failed to fetch category', 500);
  }
};
