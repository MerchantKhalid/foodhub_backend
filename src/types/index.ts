import { Request } from 'express';
import { Role, UserStatus } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'PROVIDER';
  // Provider specific
  restaurantName?: string;
  restaurantDescription?: string;
  restaurantAddress?: string;
  cuisineType?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateMealInput {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  ingredients?: string;
  isAvailable?: boolean;
  dietaryInfo?: string;
  prepTime?: number;
}

export interface UpdateMealInput extends Partial<CreateMealInput> {}

export interface CreateOrderInput {
  items: {
    mealId: string;
    quantity: number;
  }[];
  deliveryAddress: string;
  contactPhone: string;
  orderNotes?: string;
}

export interface CreateReviewInput {
  mealId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

export interface MealFilters {
  categoryId?: string;
  providerId?: string;
  dietaryInfo?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isAvailable?: boolean;
}

export interface OrderFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UserFilters {
  role?: Role;
  status?: UserStatus;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
