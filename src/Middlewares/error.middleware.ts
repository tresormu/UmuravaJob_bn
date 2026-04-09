import type { NextFunction, Request, Response } from "express";

type AppError = Error & { statusCode?: number };

const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode >= 500 ? "Internal server error" : err.message || "Request failed";
  res.status(statusCode).json({ error: message });
};

export default errorMiddleware;
