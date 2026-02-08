import { Response } from 'express';
import { ApiResponse } from '../types';
export declare const sendResponse: <T>(res: Response, statusCode: number, data: ApiResponse<T>) => Response;
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number) => Response;
export declare const sendPaginatedResponse: <T>(res: Response, data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
}, message?: string) => Response;
export declare const calculateOrderTotal: (items: {
    price: number;
    quantity: number;
}[]) => number;
export declare const generateOrderNumber: () => string;
//# sourceMappingURL=helpers.d.ts.map