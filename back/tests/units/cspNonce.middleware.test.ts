import { jest } from "@jest/globals"
import { Request, Response, NextFunction } from "express"
import { cspNonceMiddleware } from "@/middleware/security/cspNonce.js"

describe("cspNonceMiddleware", () => {
    it("should generate a base64 nonce in res.locals.cspNonce and call next", () => {
        const req = {} as Request
        const res = { locals: {} } as Response
        const next = jest.fn() as NextFunction

        cspNonceMiddleware(req, res, next)

        expect(typeof res.locals.cspNonce).toBe("string")
        expect(res.locals.cspNonce.length).toBeGreaterThan(0)
        // base64 pattern
        expect(res.locals.cspNonce).toMatch(/^[A-Za-z0-9+/]+=*$/)
        expect(next).toHaveBeenCalled()
    })
})
