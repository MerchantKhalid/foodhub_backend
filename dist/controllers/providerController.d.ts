import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createMeal: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMeal: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteMeal: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleMealAvailability: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProviderMeals: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProviderOrders: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProviderOrderById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateOrderStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProviderStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProviderReviews: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=providerController.d.ts.map