import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: ApiResponse<T>,
): Response => {
  return res.status(statusCode).json(data);
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
): Response => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
): Response => {
  return sendResponse(res, statusCode, {
    success: false,
    error: message,
  });
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
): Response => {
  return sendResponse(res, 200, {
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

export const calculateOrderTotal = (
  items: { price: number; quantity: number }[],
): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};
