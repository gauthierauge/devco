import { jest } from "@jest/globals"
import { Request, Response, NextFunction } from "express"

const mockInitializeCSRFSecret = jest.fn<any>().mockReturnValue("mock-secret")
const mockGenerateCSRFToken = jest.fn<any>().mockReturnValue("mock-token")
const mockVerifyCSRFToken = jest.fn<any>()

jest.unstable_mockModule("@/utils/csrf.js", () => ({
    initializeCSRFSecret: mockInitializeCSRFSecret,
    generateCSRFToken: mockGenerateCSRFToken,
    verifyCSRFToken: mockVerifyCSRFToken,
}))

const { csrfGenerateMiddleware, csrfVerifyMiddleware } = await import("@/middleware/security/csrf.js")

describe("csrfGenerateMiddleware", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should generate a secret if absent, create a token, and set res.locals", () => {
        mockInitializeCSRFSecret.mockReturnValue("mock-secret")
        mockGenerateCSRFToken.mockReturnValue("mock-token")

        const session: Record<string, unknown> = {}
        const req = { session } as unknown as Request
        const res = { locals: {} } as Response
        const next = jest.fn() as NextFunction

        csrfGenerateMiddleware(req, res, next)

        expect(mockInitializeCSRFSecret).toHaveBeenCalled()
        expect(session.csrfSecret).toBe("mock-secret")
        expect(mockGenerateCSRFToken).toHaveBeenCalledWith("mock-secret")
        expect(session.csrfToken).toBe("mock-token")
        expect(res.locals.csrfToken).toBe("mock-token")
        expect(next).toHaveBeenCalled()
    })

    it("should reuse existing secret", () => {
        mockGenerateCSRFToken.mockReturnValue("mock-token")

        const session: Record<string, unknown> = { csrfSecret: "existing-secret" }
        const req = { session } as unknown as Request
        const res = { locals: {} } as Response
        const next = jest.fn() as NextFunction

        csrfGenerateMiddleware(req, res, next)

        expect(mockInitializeCSRFSecret).not.toHaveBeenCalled()
        expect(mockGenerateCSRFToken).toHaveBeenCalledWith("existing-secret")
        expect(next).toHaveBeenCalled()
    })
})

describe("csrfVerifyMiddleware", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should skip for GET requests", () => {
        const req = { method: "GET", session: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        csrfVerifyMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
    })

    it("should skip for HEAD requests", () => {
        const req = { method: "HEAD", session: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        csrfVerifyMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
    })

    it("should skip for OPTIONS requests", () => {
        const req = { method: "OPTIONS", session: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        csrfVerifyMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
    })

    it("should throw 403 if no secret in session", () => {
        const req = { method: "POST", session: {}, body: { csrfToken: "tok" }, headers: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        expect(() => csrfVerifyMiddleware(req, res, next)).toThrow("CSRF secret not found in session")
    })

    it("should throw 403 if no token provided", () => {
        const req = { method: "POST", session: { csrfSecret: "sec" }, body: {}, headers: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        expect(() => csrfVerifyMiddleware(req, res, next)).toThrow("CSRF token not provided")
    })

    it("should throw 403 if token is invalid", () => {
        mockVerifyCSRFToken.mockReturnValue(false)
        const req = { method: "POST", session: { csrfSecret: "sec" }, body: { csrfToken: "bad" }, headers: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        expect(() => csrfVerifyMiddleware(req, res, next)).toThrow("Invalid CSRF token")
    })

    it("should call next if token is valid", () => {
        mockVerifyCSRFToken.mockReturnValue(true)
        const req = { method: "POST", session: { csrfSecret: "sec" }, body: { csrfToken: "valid" }, headers: {} } as unknown as Request
        const res = {} as Response
        const next = jest.fn() as NextFunction

        csrfVerifyMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
    })
})
