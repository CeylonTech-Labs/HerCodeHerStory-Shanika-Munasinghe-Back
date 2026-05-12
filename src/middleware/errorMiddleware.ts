import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler =
  <T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorMiddleware = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten().fieldErrors
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found."
    });
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    stack: env.NODE_ENV === "production" ? undefined : error.stack
  });
};
