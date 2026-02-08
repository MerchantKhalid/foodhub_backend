import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCustomerOrders: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrderById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=orderController.d.ts.map