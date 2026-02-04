import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { sendError } from '../utils/helpers';

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Insufficient permissions', 403);
    }

    next();
  };
};

export const isCustomer = authorize(Role.CUSTOMER);
export const isProvider = authorize(Role.PROVIDER);
export const isAdmin = authorize(Role.ADMIN);
export const isProviderOrAdmin = authorize(Role.PROVIDER, Role.ADMIN);
export const isCustomerOrAdmin = authorize(Role.CUSTOMER, Role.ADMIN);
