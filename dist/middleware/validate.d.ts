import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const registerValidation: ValidationChain[];
export declare const loginValidation: ValidationChain[];
export declare const createMealValidation: ValidationChain[];
export declare const updateMealValidation: ValidationChain[];
export declare const createOrderValidation: ValidationChain[];
export declare const updateOrderStatusValidation: ValidationChain[];
export declare const createReviewValidation: ValidationChain[];
export declare const createCategoryValidation: ValidationChain[];
export declare const updateUserStatusValidation: ValidationChain[];
//# sourceMappingURL=validate.d.ts.map