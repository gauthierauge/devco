import { Request, Response } from "express"
import { logger } from "../config/logger.js"
import { HttpError } from "../middleware/error.js"
import { authService } from "../services/auth.service.js"

// POST /api/auth/register
const register = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        logger.warn("Register attempt with missing email or password")
        throw new HttpError(400, "Email and password are required")
    }

    const result = await authService.register(email, password)

    logger.info({ userId: result.user.id }, "User registration successful")
    res.status(201).json(result)
}

// POST /api/auth/login
const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        logger.warn("Login attempt with missing email or password")
        throw new HttpError(400, "Email and password are required")
    }

    const result = await authService.login(email, password)

    logger.info({ userId: result.user.id }, "User login successful")
    res.status(200).json(result)
}

// POST /api/auth/logout
const logout = async (req: Request, res: Response) => {
    logger.info("User logout")
    res.status(200).json({ message: "Logged out successfully" })
}

// GET /api/auth/me (protected route - userId extraits du JWT middleware)
const getCurrentUser = async (req: Request, res: Response) => {
    const userId = (req as any).userId

    if (!userId) {
        throw new HttpError(401, "Unauthorized")
    }

    const user = await authService.getCurrentUser(userId)

    logger.info({ userId }, "Fetched current user")
    res.status(200).json(user)
}

export { register, login, logout, getCurrentUser }

