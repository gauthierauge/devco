import { Request, Response, NextFunction } from "express";
import type { ApiError } from "@/types/error.js";
import { logger } from "@/config/logger.js";

class HttpError extends Error {
    readonly statusCode: number

    constructor(statusCode: number, message: string) {
        super(message)
        this.statusCode = statusCode
    }
}

const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next)
        }

const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
    next(new HttpError(404, "Route non trouvée"))
}

const errorHandler = (
    err: Error | HttpError,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    const statusCode = err instanceof HttpError ? err.statusCode : 500
    const message = err.message || "Erreur interne du serveur"

    if (statusCode >= 500) {
        logger.error({ err, statusCode }, message)
    } else {
        logger.warn({ statusCode }, message)
    }

    const body: ApiError = { error: message }

    res.status(statusCode).json(body)
}

export { HttpError, asyncHandler, notFoundHandler, errorHandler }
