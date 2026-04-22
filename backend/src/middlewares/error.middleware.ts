import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Custom error class for API errors
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error
  logger.error({
    status: err.statusCode,
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Handle different error types
  
  // 1. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.statusCode = 400;
    err.message = `${field} already exists. Please use a different value.`;
  }

  // 2. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors)
      .map((error: any) => error.message)
      .join(', ');
    err.statusCode = 400;
    err.message = `Validation Error: ${errors}`;
  }

  // 3. Mongoose Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token format';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token has expired';
  }

  // 5. Handle operational vs programming errors
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  } else {
    // Programming error: don't leak details
    console.error('ERROR 💥:', err);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// Wrapper to catch async errors
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
