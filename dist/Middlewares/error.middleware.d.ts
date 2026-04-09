import type { NextFunction, Request, Response } from "express";
type AppError = Error & {
    statusCode?: number;
};
declare const errorMiddleware: (err: AppError, _req: Request, res: Response, _next: NextFunction) => void;
export default errorMiddleware;
//# sourceMappingURL=error.middleware.d.ts.map