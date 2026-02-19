import { Request, Response, NextFunction } from "express"
import { filterXSS } from "xss"

const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === "string") return filterXSS(value)
    if (Array.isArray(value)) return value.map(sanitizeValue)
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)])
        )
    }
    return value
}

const xssSanitizer = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) req.body = sanitizeValue(req.body);
    next();
}

export { xssSanitizer }
