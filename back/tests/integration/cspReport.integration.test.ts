import { jest } from "@jest/globals"
import request from "supertest"
import type { Express } from "express"
import type { Request, Response, NextFunction } from "express"

const mockedRepo = {
    createCspReport: jest.fn<any>(),
    countCspReports: jest.fn<any>(),
    getLatestCspReports: jest.fn<any>(),
    deleteCspReportsByIds: jest.fn<any>(),
    findAllCspReports: jest.fn<any>(),
}

jest.unstable_mockModule("@/config/db.js", () => ({ prisma: {} }))
jest.unstable_mockModule("@/repositories/cspReport.repository.js", () => mockedRepo)
jest.unstable_mockModule("@/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))
jest.unstable_mockModule("@/middleware/session.js", () => ({
    sessionMiddleware: (req: Request, _res: Response, next: NextFunction) => {
        (req as any).session = {};
        next()
    },
}))
jest.unstable_mockModule("@/middleware/security/csrf.js", () => ({
    csrfGenerateMiddleware: (_req: Request, _res: Response, next: NextFunction) => next(),
    csrfVerifyMiddleware: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

const { createApp } = await import("@/app.js")

let app: Express

beforeAll(() => {
    app = createApp()
})

beforeEach(() => jest.clearAllMocks())

describe("POST /api/v1/csp-report", () => {
    it("should accept a valid CSP report with csp-report wrapper", async () => {
        mockedRepo.createCspReport.mockResolvedValue({ id: 1, payload: {}, createdAt: new Date() })
        mockedRepo.countCspReports.mockResolvedValue(1)

        const res = await request(app)
            .post("/api/v1/csp-report")
            .set("Content-Type", "application/csp-report")
            .send(JSON.stringify({
                "csp-report": {
                    "document-uri": "https://example.com",
                    "violated-directive": "script-src",
                },
            }))

        expect(res.status).toBe(204)
        expect(mockedRepo.createCspReport).toHaveBeenCalled()
    })

    it("should accept a valid CSP report with application/json", async () => {
        mockedRepo.createCspReport.mockResolvedValue({ id: 1, payload: {}, createdAt: new Date() })
        mockedRepo.countCspReports.mockResolvedValue(1)

        const res = await request(app)
            .post("/api/v1/csp-report")
            .set("Content-Type", "application/json")
            .send({
                "document-uri": "https://example.com",
                "violated-directive": "script-src",
            })

        expect(res.status).toBe(204)
        expect(mockedRepo.createCspReport).toHaveBeenCalled()
    })

    it("should return 204 but not save an invalid payload", async () => {
        const res = await request(app)
            .post("/api/v1/csp-report")
            .set("Content-Type", "application/json")
            .send({ invalid: true })

        expect(res.status).toBe(204)
        expect(mockedRepo.createCspReport).not.toHaveBeenCalled()
    })

    it("should set Report-To header on response", async () => {
        mockedRepo.createCspReport.mockResolvedValue({ id: 1, payload: {}, createdAt: new Date() })
        mockedRepo.countCspReports.mockResolvedValue(1)

        const res = await request(app)
            .post("/api/v1/csp-report")
            .set("Content-Type", "application/json")
            .send({
                "document-uri": "https://example.com",
                "violated-directive": "script-src",
            })

        expect(res.headers["report-to"]).toBeDefined()
    })
})

describe("GET /api/v1/csp-reports", () => {
    it("should return reports as JSON", async () => {
        mockedRepo.countCspReports.mockResolvedValue(0)
        mockedRepo.findAllCspReports.mockResolvedValue([])

        const res = await request(app).get("/api/v1/csp-reports")

        expect(res.status).toBe(200)
        expect(res.headers["content-type"]).toMatch(/json/)
    })
})

describe("CSP routes - 404", () => {
    it("should return 404 for unknown routes", async () => {
        const res = await request(app).get("/api/v1/unknown-route")

        expect(res.status).toBe(404)
    })
})
