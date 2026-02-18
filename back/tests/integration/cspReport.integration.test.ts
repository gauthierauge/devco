import request from "supertest"
import { createApp } from "../../src/app.js"
import * as repository from "../../src/repositories/cspReport.repository.js"
import type { Express } from "express"

jest.mock("../../src/config/db.js", () => ({ prisma: {} }))
jest.mock("../../src/repositories/cspReport.repository.js")
jest.mock("../../src/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const mockedRepo = repository as jest.Mocked<typeof repository>

let app: Express

beforeAll(() => {
    app = createApp()
})

beforeEach(() => jest.clearAllMocks())

describe("POST /api/csp-report", () => {
    it("should accept a valid CSP report with csp-report wrapper", async () => {
        mockedRepo.createCspReport.mockResolvedValue({ id: 1, payload: {}, createdAt: new Date() })
        mockedRepo.countCspReports.mockResolvedValue(1)

        const res = await request(app)
            .post("/api/csp-report")
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
            .post("/api/csp-report")
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
            .post("/api/csp-report")
            .set("Content-Type", "application/json")
            .send({ invalid: true })

        expect(res.status).toBe(204)
        expect(mockedRepo.createCspReport).not.toHaveBeenCalled()
    })

    it("should set Report-To header on response", async () => {
        mockedRepo.createCspReport.mockResolvedValue({ id: 1, payload: {}, createdAt: new Date() })
        mockedRepo.countCspReports.mockResolvedValue(1)

        const res = await request(app)
            .post("/api/csp-report")
            .set("Content-Type", "application/json")
            .send({
                "document-uri": "https://example.com",
                "violated-directive": "script-src",
            })

        expect(res.headers["report-to"]).toBeDefined()
    })
})

describe("GET /api/csp-reports", () => {
    it("should return reports as JSON", async () => {
        mockedRepo.countCspReports.mockResolvedValue(0)

        const res = await request(app).get("/api/csp-reports")

        expect(res.status).toBe(200)
        expect(res.headers["content-type"]).toMatch(/json/)
    })
})

describe("CSP routes - 404", () => {
    it("should return 404 for unknown routes", async () => {
        const res = await request(app).get("/api/unknown-route")

        expect(res.status).toBe(404)
    })
})
