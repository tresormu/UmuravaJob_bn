import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/type.js";
import { ResponseMessages } from "../utils/responseMessages.js";

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: ResponseMessages.ERROR.FORBIDDEN });
    }
    next();
  };
};
