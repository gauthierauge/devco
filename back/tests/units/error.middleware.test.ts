import { jest } from "@jest/globals"
import { Request, Response, NextFunction } from "express"

const mockLogger = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}

jest.unstable_mockModule("@/config/logger.js", () => ({
    logger: mockLogger,
}))

const { HttpError, asyncHandler, notFoundHandler, errorHandler } = await import("@/middleware/error.js")

const mockRes = () => {
    const res = {} as Response
    res.status = jest.fn().mockReturnThis() as any
    res.json = jest.fn().mockReturnThis() as any
    return res
}

describe("HttpError", () => {
    it("crée une erreur avec statusCode et message", () => {
        const err = new HttpError(404, "Not found")

        expect(err).toBeInstanceOf(Error)
        expect(err.statusCode).toBe(404)
        expect(err.message).toBe("Not found")
    })
})

describe("asyncHandler", () => {
    it("catch les erreurs async et les passe a next", async () => {
        const error = new Error("async failure")
        const fn = async () => { throw error }
        const next = jest.fn() as NextFunction
        const req = {} as Request
        const res = mockRes()

        const handler = asyncHandler(fn)
        await handler(req, res, next)

        expect(next).toHaveBeenCalledWith(error)
    })

    it("n'appelle pas next quand il y a pas d'erreur", async () => {
        const fn = async (_req: Request, _res: Response, _next: NextFunction) => {}
        const next = jest.fn() as NextFunction
        const req = {} as Request
        const res = mockRes()

        const handler = asyncHandler(fn)
        await handler(req, res, next)

        expect(next).not.toHaveBeenCalled()
    })
})

describe("notFoundHandler", () => {
    it("appelle next avec une HttpError 404", () => {
        const req = {} as Request
        const res = mockRes()
        const next = jest.fn() as NextFunction

        notFoundHandler(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.any(HttpError))
        const err = (next as unknown as jest.Mock).mock.calls[0][0] as any
        expect(err.statusCode).toBe(404)
        expect(err.message).toBe("Route non trouvée")
    })
})

describe("errorHandler", () => {
    beforeEach(() => jest.clearAllMocks())

    it("retourne le statusCode depuis HttpError", () => {
        const err = new HttpError(422, "Validation failed")
        const req = {} as Request
        const res = mockRes()
        const next = jest.fn() as NextFunction

        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.json).toHaveBeenCalledWith({ error: "Validation failed" })
    })

    it("retourne 500 pour une Error standard", () => {
        const err = new Error("Something broke")
        const req = {} as Request
        const res = mockRes()
        const next = jest.fn() as NextFunction

        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: "Something broke" })
    })

    it("log error pour les codes 500+", () => {
        const err = new HttpError(500, "Server error")
        const req = {} as Request
        const res = mockRes()
        const next = jest.fn() as NextFunction

        errorHandler(err, req, res, next)

        expect(mockLogger.error).toHaveBeenCalled()
    })

    it("log warn pour les codes 4xx", () => {
        const err = new HttpError(400, "Bad request")
        const req = {} as Request
        const res = mockRes()
        const next = jest.fn() as NextFunction

        errorHandler(err, req, res, next)

        expect(mockLogger.warn).toHaveBeenCalled()
    })
})
