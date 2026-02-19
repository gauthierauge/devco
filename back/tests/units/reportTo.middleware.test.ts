import { Request, Response, NextFunction } from "express"

jest.mock("@/config/env.js", () => ({
    BACKEND_URL: "http://localhost:5000",
}))

import { reportToMiddleware } from "@/middleware/security/reportTo.js"

describe("reportToMiddleware", () => {
    it("should set Report-To header and call next", () => {
        const req = {} as Request
        const res = { header: jest.fn() } as unknown as Response
        const next = jest.fn() as NextFunction

        reportToMiddleware(req, res, next)

        expect(res.header).toHaveBeenCalledWith("Report-to", expect.any(String))
        expect(next).toHaveBeenCalled()

        const headerValue = (res.header as jest.Mock).mock.calls[0][1]
        const parsed = JSON.parse(headerValue)
        expect(parsed.group).toBe("csp-endpoint")
        expect(parsed.endpoints[0].url).toBe("http://localhost:5000/api/csp-report")
    })
})
