import { Request, Response, NextFunction } from "express"
import { HttpError } from "@/middleware/error.js"

declare global {
    namespace Express {
        interface Request {
            userId?: number
        }
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.session as any).userId

    if (!userId) {
        throw new HttpError(401, "Unauthorized")
    }

    req.userId = userId
    next()
}

export { authMiddleware }
