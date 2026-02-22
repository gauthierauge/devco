import { Request, Response, NextFunction } from "express"
import { HttpError } from "@/middleware/error.js"
import { CartItem } from "@/controllers/cart.controller.js"

declare module "express-session" {
    interface SessionData {
        userId?: number
        cart?: CartItem[]
        csrfSecret?: string
        csrfToken?: string
    }
}

declare module "express" {
    interface Request {
        userId?: number
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.userId

    if (!userId) {
        throw new HttpError(401, "Unauthorized")
    }

    req.userId = userId
    next()
}

export { authMiddleware }
