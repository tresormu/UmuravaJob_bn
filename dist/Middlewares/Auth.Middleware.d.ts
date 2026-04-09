import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/type.js";
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=Auth.Middleware.d.ts.map