import { logger } from "@/config/logger.js"
import { HttpError } from "@/middleware/error.js"
import type { UserResponse } from "@/types/auth.js"
import { hashPassword, validatePassword } from "@/utils/password.js"
import { createUser, findUserByEmail, findUserById } from "@/repositories/user.repository.js"

const register = async (
    email: string,
    password: string
): Promise<UserResponse> => {
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
        logger.warn({ email }, "Registration attempt with already existing email")
        throw new HttpError(400, "Email already in use")
    }

    if (password.length < 8) {
        logger.warn({ email }, "Registration attempt with weak password")
        throw new HttpError(400, "Password must be at least 8 characters")
    }

    const hashedPassword = await hashPassword(password)
    const user = await createUser(email, hashedPassword)

    logger.info({ userId: user.id, email }, "User registered successfully")

    return {
        id: user.id,
        email: user.email,
    }
}

const login = async (email: string, password: string): Promise<UserResponse> => {
    const user = await findUserByEmail(email)
    if (!user) {
        logger.warn({ email }, "Login attempt with non-existent email")
        throw new HttpError(401, "Invalid email or password")
    }

    const isPasswordValid = await validatePassword(password, user.password)
    if (!isPasswordValid) {
        logger.warn({ email }, "Login attempt with wrong password")
        throw new HttpError(401, "Invalid email or password")
    }

    logger.info({ userId: user.id, email }, "User logged in successfully")

    return {
        id: user.id,
        email: user.email,
    }
}

const getCurrentUser = async (userId: number): Promise<UserResponse> => {
    const user = await findUserById(userId)
    if (!user) {
        logger.warn({ userId }, "Attempt to fetch non-existent user")
        throw new HttpError(404, "User not found")
    }

    return {
        id: user.id,
        email: user.email,
    }
}

export const authService = {
    register,
    login,
    validatePassword,
    getCurrentUser,
}