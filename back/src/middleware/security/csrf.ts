import { Request, Response, NextFunction } from "express"
import { HttpError } from "@/middleware/error.js"
import { generateCSRFToken, verifyCSRFToken, initializeCSRFSecret } from "@/utils/csrf.js"
import {CSRF_SECRET_KEY, CSRF_TOKEN_KEY} from "@/constants/csrf.constant.js";

const csrfGenerateMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session

    if (!session[CSRF_SECRET_KEY]) {
        session[CSRF_SECRET_KEY] = initializeCSRFSecret()
    }

    const token = generateCSRFToken(session[CSRF_SECRET_KEY])
    session[CSRF_TOKEN_KEY] = token
    res.locals.csrfToken = token

    next()
}

const csrfVerifyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next()
    }

    const session = req.session
    const secret = session[CSRF_SECRET_KEY]
    const token = req.body?.csrfToken || req.headers["x-csrf-token"]

    if (!secret) {
        throw new HttpError(403, "CSRF secret not found in session")
    }

    if (!token) {
        throw new HttpError(403, "CSRF token not provided")
    }

    if (!verifyCSRFToken(secret, token as string)) {
        throw new HttpError(403, "Invalid CSRF token")
    }

    next()
}

export { csrfGenerateMiddleware, csrfVerifyMiddleware }
