import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateUserStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllOrders: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrderDetails: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createCategory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCategory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCategory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllReviews: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPlatformStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=adminController.d.ts.map