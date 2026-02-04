import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CreateOrderInput } from '../types';
import {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
} from '../utils/helpers';

const prisma = new PrismaClient();

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const {
      items,
      deliveryAddress,
      contactPhone,
      orderNotes,
    }: CreateOrderInput = req.body;

    // Get all meal details
    const mealIds = items.map((item) => item.mealId);
    const meals = await prisma.meal.findMany({
      where: { id: { in: mealIds }, isAvailable: true },
    });

    if (meals.length !== items.length) {
      return sendError(res, 'Some meals are not available', 400);
    }

    // Verify all meals are from the same provider
    const providerIds = [...new Set(meals.map((m) => m.providerId))];
    if (providerIds.length !== 1) {
      return sendError(res, 'All items must be from the same provider', 400);
    }

    const providerId = providerIds[0];

    // Calculate total
    const orderItems = items.map((item) => {
      const meal = meals.find((m) => m.id === item.mealId)!;
      return {
        mealId: item.mealId,
        quantity: item.quantity,
        priceAtOrder: meal.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0,
    );

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId,
        providerId,
        deliveryAddress,
        contactPhone,
        orderNotes,
        totalAmount,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            meal: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            providerProfile: {
              select: {
                restaurantName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, order, 'Order placed successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    return sendError(res, 'Failed to place order', 500);
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { customerId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
          reviews: {
            select: {
              id: true,
              mealId: true,
            },
          },
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
    console.error('Get customer orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            providerProfile: {
              select: {
                restaurantName: true,
                address: true,
                phone: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            meal: true,
          },
        },
        reviews: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Check access
    if (role === 'CUSTOMER' && order.customerId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    if (role === 'PROVIDER' && order.providerId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, order);
  } catch (error) {
    console.error('Get order by id error:', error);
    return sendError(res, 'Failed to fetch order', 500);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.userId;

    const order = await prisma.order.findFirst({
      where: { id, customerId },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.status !== 'PENDING') {
      return sendError(res, 'Only pending orders can be cancelled', 400);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return sendSuccess(res, updatedOrder, 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);
    return sendError(res, 'Failed to cancel order', 500);
  }
};
