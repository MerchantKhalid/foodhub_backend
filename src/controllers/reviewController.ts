import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CreateReviewInput } from '../types';
import {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
} from '../utils/helpers';

const prisma = new PrismaClient();

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const { mealId, orderId, rating, comment }: CreateReviewInput = req.body;

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
      return sendError(res, 'Order not found or not delivered yet', 404);
    }

    // Verify meal was in the order
    const mealInOrder = order.orderItems.some((item) => item.mealId === mealId);
    if (!mealInOrder) {
      return sendError(res, 'Meal was not part of this order', 400);
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
      return sendError(
        res,
        'You have already reviewed this meal for this order',
        400,
      );
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

    return sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    console.error('Create review error:', error);
    return sendError(res, 'Failed to submit review', 500);
  }
};

export const getMealReviews = async (req: Request, res: Response) => {
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

    return sendPaginatedResponse(res, reviews, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get meal reviews error:', error);
    return sendError(res, 'Failed to fetch reviews', 500);
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.userId;
    const { rating, comment } = req.body;

    const existingReview = await prisma.review.findFirst({
      where: { id, customerId },
    });

    if (!existingReview) {
      return sendError(res, 'Review not found', 404);
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
      },
    });

    return sendSuccess(res, review, 'Review updated successfully');
  } catch (error) {
    console.error('Update review error:', error);
    return sendError(res, 'Failed to update review', 500);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.userId;

    const existingReview = await prisma.review.findFirst({
      where: { id, customerId },
    });

    if (!existingReview) {
      return sendError(res, 'Review not found', 404);
    }

    await prisma.review.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    return sendError(res, 'Failed to delete review', 500);
  }
};

export const getCustomerReviews = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;

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

    return sendSuccess(res, reviews);
  } catch (error) {
    console.error('Get customer reviews error:', error);
    return sendError(res, 'Failed to fetch reviews', 500);
  }
};
