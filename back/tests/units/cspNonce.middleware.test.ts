import { jest } from "@jest/globals"
import { Request, Response, NextFunction } from "express"
import { cspNonceMiddleware } from "@/middleware/security/cspNonce.js"

describe("cspNonceMiddleware", () => {
    it("doit generer un nonce base64 dans res.locals.cspNonce et appeler next", () => {
        const req = {} as Request
        const res = { locals: {} } as Response
        const next = jest.fn() as NextFunction

        cspNonceMiddleware(req, res, next)

        expect(typeof res.locals.cspNonce).toBe("string")
        expect(res.locals.cspNonce.length).toBeGreaterThan(0)
        // pattern base64
        expect(res.locals.cspNonce).toMatch(/^[A-Za-z0-9+/]+=*$/)
        expect(next).toHaveBeenCalled()
    })
})
