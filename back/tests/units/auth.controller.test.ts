import { jest } from "@jest/globals"
import { Request, Response } from "express"

const mockAuthService = {
    register: jest.fn<any>(),
    login: jest.fn<any>(),
    getCurrentUser: jest.fn<any>(),
    validatePassword: jest.fn<any>(),
}

jest.unstable_mockModule("@/config/db.js", () => ({ prisma: {} }))
jest.unstable_mockModule("@/repositories/user.repository.js", () => ({
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    findUserById: jest.fn(),
}))
jest.unstable_mockModule("@/services/auth.service.js", () => ({
    authService: mockAuthService,
}))
jest.unstable_mockModule("@/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const { registerHandler, loginHandler, logoutHandler, getCurrentUserHandler } = await import("@/controllers/auth.controller.js")

const mockRes = () => {
    const res = {} as Response
    res.status = jest.fn().mockReturnThis() as any
    res.json = jest.fn().mockReturnThis() as any
    return res
}

describe("registerHandler", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should throw 400 if email or password is missing", async () => {
        const req = { body: { email: "" } } as Request
        const res = mockRes()

        await expect(registerHandler(req, res)).rejects.toThrow("Email and password are required")
    })

    it("should call authService.register, set session.userId, and return 201", async () => {
        const session: Record<string, unknown> = {}
        const req = { body: { email: "test@test.com", password: "password123" }, session } as unknown as Request
        const res = mockRes()

        mockAuthService.register.mockResolvedValue({ id: 1, email: "test@test.com" })

        await registerHandler(req, res)

        expect(mockAuthService.register).toHaveBeenCalledWith("test@test.com", "password123")
        expect(session.userId).toBe(1)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({ id: 1, email: "test@test.com" })
    })
})

describe("loginHandler", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should throw 400 if email or password is missing", async () => {
        const req = { body: { password: "pass" } } as Request
        const res = mockRes()

        await expect(loginHandler(req, res)).rejects.toThrow("Email and password are required")
    })

    it("should call authService.login, set session.userId, and return 200", async () => {
        const session: Record<string, unknown> = {}
        const req = { body: { email: "test@test.com", password: "password123" }, session } as unknown as Request
        const res = mockRes()

        mockAuthService.login.mockResolvedValue({ id: 1, email: "test@test.com" })

        await loginHandler(req, res)

        expect(mockAuthService.login).toHaveBeenCalledWith("test@test.com", "password123")
        expect(session.userId).toBe(1)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({ id: 1, email: "test@test.com" })
    })
})

describe("logoutHandler", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should destroy the session and return 200", async () => {
        const destroyFn = jest.fn<any>((cb: (err?: Error) => void) => cb())
        const req = { session: { destroy: destroyFn } } as unknown as Request
        const res = mockRes()

        await logoutHandler(req, res)

        expect(destroyFn).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" })
    })
})

describe("getCurrentUserHandler", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should throw 401 if no userId", async () => {
        const req = { userId: undefined } as unknown as Request
        const res = mockRes()

        await expect(getCurrentUserHandler(req, res)).rejects.toThrow("Unauthorized")
    })

    it("should return the user with status 200", async () => {
        const req = { userId: 1 } as unknown as Request
        const res = mockRes()

        mockAuthService.getCurrentUser.mockResolvedValue({ id: 1, email: "test@test.com" })

        await getCurrentUserHandler(req, res)

        expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(1)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({ id: 1, email: "test@test.com" })
    })
})
