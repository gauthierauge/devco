import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/env.js"
import { logger } from "../config/logger.js"
import type { AuthPayload } from "../types/auth.js"

export const generateToken = (userId: number): string => {
    const payload: AuthPayload = { userId }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export const verifyToken = (token: string): AuthPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
        return decoded
    } catch (error) {
        logger.warn(`Invalid token: ${error}`)
        return null
    }
}
