import { Request, Response } from 'express';
import { AuthRequest } from '../types';
export declare const createReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMealReviews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCustomerReviews: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=reviewController.d.ts.map