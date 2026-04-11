import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.message === 'Authentication required' || err.message === 'Invalid or expired token'
    ? 401
    : err.message === 'Validation error'
    ? 400
    : 500;

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
};
