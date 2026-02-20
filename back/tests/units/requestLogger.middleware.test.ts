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

const { requestLogger } = await import("@/middleware/requestLogger.js")

describe("requestLogger", () => {
    beforeEach(() => jest.clearAllMocks())

    const createReqRes = (statusCode: number) => {
        const req = { method: "GET", originalUrl: "/test", ip: "127.0.0.1" } as Request
        const listeners: Record<string, Function> = {}
        const res = {
            statusCode,
            on: jest.fn((event: string, cb: Function) => { listeners[event] = cb }),
        } as unknown as Response
        const next = jest.fn() as NextFunction
        return { req, res, next, listeners }
    }

    it("doit appeler next() tout de suite", () => {
        const { req, res, next } = createReqRes(200)

        requestLogger(req, res, next)

        expect(next).toHaveBeenCalled()
    })

    it("log info pour les codes 2xx quand la requete se termine", () => {
        const { req, res, next, listeners } = createReqRes(200)

        requestLogger(req, res, next)
        listeners.finish()

        expect(mockLogger.info).toHaveBeenCalled()
    })

    it("log warn pour les codes 4xx quand la requête se termine", () => {
        const { req, res, next, listeners } = createReqRes(404)

        requestLogger(req, res, next)
        listeners.finish()

        expect(mockLogger.warn).toHaveBeenCalled()
    })

    it("log error pour les codes 5xx", () => {
        const { req, res, next, listeners } = createReqRes(500)

        requestLogger(req, res, next)
        listeners.finish()

        expect(mockLogger.error).toHaveBeenCalled()
    })
})
