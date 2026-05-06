import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
    statusCode?: number;
}

export const errorHandler = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[Error] ${req.method} ${req.url}:`, err);

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
