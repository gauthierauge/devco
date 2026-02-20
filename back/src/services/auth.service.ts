import { logger } from "@/config/logger.js"
import { HttpError } from "@/middleware/error.js"
import type { UserResponse } from "@/types/auth.js"
import { hashPassword, validatePassword } from "@/utils/password.js"
import { createUser, findUserByEmail, findUserById } from "@/repositories/user.repository.js"

const MIN_PASSWORD_LENGTH = 15
const MAX_PASSWORD_LENGTH = 128
const BLOCKED_PASSWORDS = new Set([
    "password",
    "password1",
    "123456",
    "123456789",
    "qwerty",
    "azerty",
    "admin",
    "letmein",
    "welcome",
    "iloveyou",
    "devco",
    "maisondeco",
    "maison déco",
])

const isBlockedPassword = (email: string, password: string) => {
    const normalized = password.trim().toLowerCase()
    if (BLOCKED_PASSWORDS.has(normalized)) return true

    const [localPart, domain] = email.toLowerCase().split("@")
    if (localPart && normalized.includes(localPart)) return true
    if (domain && normalized.includes(domain)) return true

    return false
}

const register = async (
    email: string,
    password: string
): Promise<UserResponse> => {
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
        logger.warn({ email }, "Registration attempt with already existing email")
        throw new HttpError(400, "Email already in use")
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        logger.warn({ email }, "Registration attempt with weak password")
        throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
        logger.warn({ email }, "Registration attempt with overly long password")
        throw new HttpError(400, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`)
    }

    if (isBlockedPassword(email, password)) {
        logger.warn({ email }, "Registration attempt with blocked password")
        throw new HttpError(400, "Password is too common or contains user information")
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