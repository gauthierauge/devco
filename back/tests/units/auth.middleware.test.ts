import { jest } from "@jest/globals"
import { Request, Response, NextFunction } from "express"
import { HttpError } from "@/middleware/error.js"
import { authMiddleware } from "@/middleware/security/auth.js"

describe("authMiddleware", () => {
    it("should set req.userId and call next when session.userId exists", () => {
        const req = { session: { userId: 42 } } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        authMiddleware(req, res, next)

        expect(req.userId).toBe(42)
        expect(next).toHaveBeenCalled()
    })

    it("should throw HttpError 401 when session has no userId", () => {
        const req = { session: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        expect(() => authMiddleware(req, res, next)).toThrow(HttpError)
        expect(() => authMiddleware(req, res, next)).toThrow("Unauthorized")
    })
})
