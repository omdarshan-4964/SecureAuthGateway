import { Response } from 'express';
import { APIResponse } from '@/types';

/**
 * STANDARDIZED API RESPONSE UTILITIES
 ** "I created a standardized response format to ensure consistency across all API endpoints.
 * This makes the API easier to consume for frontend developers and third-party integrations.
 * It also simplifies error handling and logging."
 */

/**
 * Success Response
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const response: APIResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

/**
 * Error Response
 */
export const sendError = (
  res: Response,
  message: string,
  error?: string,
  statusCode: number = 400
): Response => {
  const response: APIResponse = {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

/**
 * Validation Error Response
 */
export const sendValidationError = (
  res: Response,
  errors: any[]
): Response => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors,
    timestamp: new Date().toISOString(),
  });
};
