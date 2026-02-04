import { Response } from 'express';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { AuthRequest } from '../types';
import {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
} from '../utils/helpers';

const prisma = new PrismaClient();

// User Management
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (role) where.role = role as Role;
    if (status) where.status = status as UserStatus;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          providerProfile: {
            select: {
              restaurantName: true,
            },
          },
          _count: {
            select: {
              customerOrders: true,
              providerOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return sendPaginatedResponse(res, users, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return sendError(res, 'Failed to fetch users', 500);
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: true,
        _count: {
          select: {
            customerOrders: true,
            providerOrders: true,
            meals: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    console.error('Get user by id error:', error);
    return sendError(res, 'Failed to fetch user', 500);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent admin from suspending themselves
    if (user.id === req.user!.userId) {
      return sendError(res, 'Cannot modify your own status', 400);
    }

    // Prevent modifying other admins
    if (user.role === 'ADMIN') {
      return sendError(res, 'Cannot modify admin status', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return sendSuccess(res, updatedUser, `User ${status.toLowerCase()}`);
  } catch (error) {
    console.error('Update user status error:', error);
    return sendError(res, 'Failed to update user status', 500);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.id === req.user!.userId) {
      return sendError(res, 'Cannot delete your own account', 400);
    }

    if (user.role === 'ADMIN') {
      return sendError(res, 'Cannot delete admin accounts', 400);
    }

    await prisma.user.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return sendError(res, 'Failed to delete user', 500);
  }
};

// Order Management
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, providerId, customerId, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (status) where.status = status;
    if (providerId) where.providerId = providerId;
    if (customerId) where.customerId = customerId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
          provider: {
            select: {
              id: true,
              name: true,
              providerProfile: { select: { restaurantName: true } },
            },
          },
          _count: { select: { orderItems: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return sendPaginatedResponse(res, orders, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

export const getOrderDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        provider: {
          select: {
            id: true,
            name: true,
            providerProfile: {
              select: { restaurantName: true, address: true },
            },
          },
        },
        orderItems: {
          include: { meal: true },
        },
        reviews: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, order);
  } catch (error) {
    console.error('Get order details error:', error);
    return sendError(res, 'Failed to fetch order', 500);
  }
};

// Category Management
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return sendError(res, 'Category already exists', 409);
    }

    const category = await prisma.category.create({
      data: { name, description, imageUrl },
    });

    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    return sendError(res, 'Failed to create category', 500);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    return sendError(res, 'Failed to update category', 500);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category has meals
    const mealCount = await prisma.meal.count({
      where: { categoryId: id },
    });

    if (mealCount > 0) {
      return sendError(
        res,
        `Cannot delete category with ${mealCount} meals. Reassign meals first.`,
        400,
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return sendError(res, 'Failed to delete category', 500);
  }
};

// Review Moderation
export const getAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        include: {
          customer: { select: { id: true, name: true, email: true } },
          meal: {
            select: {
              id: true,
              name: true,
              provider: {
                select: {
                  providerProfile: { select: { restaurantName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.review.count(),
    ]);

    return sendPaginatedResponse(res, reviews, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    return sendError(res, 'Failed to fetch reviews', 500);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    return sendError(res, 'Failed to delete review', 500);
  }
};

// Platform Statistics
export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      activeUsers,
      suspendedUsers,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      totalMeals,
      totalCategories,
      totalReviews,
      recentOrders,
      topProviders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.order.count(),
      prisma.order.count({
        where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } },
      }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      prisma.meal.count(),
      prisma.category.count(),
      prisma.review.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          provider: {
            select: { providerProfile: { select: { restaurantName: true } } },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['providerId'],
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),
    ]);

    // Get provider details for top providers
    const providerIds = topProviders.map((p) => p.providerId);
    const providerDetails = await prisma.user.findMany({
      where: { id: { in: providerIds } },
      select: {
        id: true,
        providerProfile: { select: { restaurantName: true } },
      },
    });

    const topProvidersWithDetails = topProviders.map((tp) => ({
      ...providerDetails.find((p) => p.id === tp.providerId),
      totalOrders: tp._count,
      totalRevenue: tp._sum.totalAmount,
    }));

    return sendSuccess(res, {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        providers: totalProviders,
        active: activeUsers,
        suspended: suspendedUsers,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: totalRevenue._sum.totalAmount || 0,
      meals: totalMeals,
      categories: totalCategories,
      reviews: totalReviews,
      recentOrders,
      topProviders: topProvidersWithDetails,
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    return sendError(res, 'Failed to fetch statistics', 500);
  }
};
