import { jest } from "@jest/globals"
import { Request, Response, NextFunction } from "express"

jest.unstable_mockModule("@/config/env.js", () => ({
    BACKEND_URL: "http://localhost:5000",
}))

const { reportToMiddleware } = await import("@/middleware/security/reportTo.js")

describe("reportToMiddleware", () => {
    it("met le header Report-To et appelle next", () => {
        const req = {} as Request
        const res = { header: jest.fn() } as unknown as Response
        const next = jest.fn() as NextFunction

        reportToMiddleware(req, res, next)

        expect(res.header).toHaveBeenCalledWith("Report-to", expect.any(String))
        expect(next).toHaveBeenCalled()

        const headerValue = (res.header as unknown as jest.Mock).mock.calls[0][1] as string
        const parsed = JSON.parse(headerValue)
        expect(parsed.group).toBe("csp-endpoint")
        expect(parsed.endpoints[0].url).toBe("http://localhost:5000/api/csp-report")
    })
})
