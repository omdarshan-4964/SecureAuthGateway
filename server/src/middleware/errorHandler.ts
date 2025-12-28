import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { sendError } from '@/utils/response';

/**
 * CUSTOM ERROR CLASS
 ** "I created a custom error class that extends the native Error object to include HTTP status codes.
 * This allows me to throw domain-specific errors that automatically map to the correct HTTP response."
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * GLOBAL ERROR HANDLER MIDDLEWARE
 ** "This is a centralized error handler that catches all errors thrown in the application.
 * It differentiates between operational errors (expected, like validation failures) and
 * programming errors (bugs), logging appropriately and sending user-friendly responses."
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Check if it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error details
  if (!isOperational) {
    // Programming error - log full stack trace
    logger.error('💥 PROGRAMMING ERROR:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    // Operational error - log minimal info
    logger.warn('⚠️  Operational Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Send response
  sendError(
    res,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode
  );
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async Handler Wrapper
 ** "This utility wraps async route handlers to automatically catch any errors and pass them to the error handler.
 * This eliminates the need for try-catch blocks in every route, keeping code clean and DRY."
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
