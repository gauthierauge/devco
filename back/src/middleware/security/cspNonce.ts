import crypto from "crypto"
import { Request, Response, NextFunction } from "express"

const cspNonceMiddleware = (_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64")
    next()
}

export { cspNonceMiddleware }
