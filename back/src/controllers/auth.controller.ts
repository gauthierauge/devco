import { Request, Response } from "express"
import { logger } from "@/config/logger.js"
import { HttpError } from "@/middleware/error.js"
import { authService } from "@/services/auth.service.js"

// POST /api/auth/register
const registerHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        logger.warn("Register attempt with missing email or password")
        throw new HttpError(400, "Email and password are required")
    }

    const user = await authService.register(email, password);
    (req.session as any).userId = user.id

    logger.info({ userId: user.id }, "User registration successful")
    res.status(201).json(user)
}

// POST /api/auth/login
const loginHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        logger.warn("Login attempt with missing email or password")
        throw new HttpError(400, "Email and password are required")
    }

    const user = await authService.login(email, password);
    (req.session as any).userId = user.id

    logger.info({ userId: user.id }, "User login successful")
    res.status(200).json(user)
}

// POST /api/auth/logout
const logoutHandler = async (req: Request, res: Response) => {
    logger.info("User logout")
    await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => err ? reject(err) : resolve())
    })
    res.status(200).json({ message: "Logged out successfully" })
}

// GET /api/auth/me
const getCurrentUserHandler = async (req: Request, res: Response) => {
    const userId = req.userId

    if (!userId) {
        throw new HttpError(401, "Unauthorized")
    }

    const user = await authService.getCurrentUser(userId)

    logger.info({ userId }, "Fetched current user")
    res.status(200).json(user)
}

export { registerHandler, loginHandler, logoutHandler, getCurrentUserHandler }

