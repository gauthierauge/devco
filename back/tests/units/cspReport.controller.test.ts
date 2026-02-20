import { jest } from "@jest/globals"
import { Request, Response } from "express"

const mockService = {
    saveCspReport: jest.fn<any>(),
    cleanupOldReports: jest.fn<any>(),
    listCspReports: jest.fn<any>(),
}

jest.unstable_mockModule("@/config/db.js", () => ({ prisma: {} }))
jest.unstable_mockModule("@/repositories/cspReport.repository.js", () => ({
    createCspReport: jest.fn(),
    countCspReports: jest.fn(),
    getLatestCspReports: jest.fn(),
    deleteCspReportsByIds: jest.fn(),
    findAllCspReports: jest.fn(),
}))
jest.unstable_mockModule("@/services/cspReport.service.js", () => mockService)
jest.unstable_mockModule("@/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const { receiveCspReport, listCspReports } = await import("@/controllers/cspReport.controller.js")

const mockRes = () => {
    const res = {} as Response
    res.status = jest.fn().mockReturnThis() as any
    res.send = jest.fn().mockReturnThis() as any
    res.json = jest.fn().mockReturnThis() as any
    return res
}

describe("receiveCspReport", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should return 204 when report is saved", async () => {
        const req = { body: { "csp-report": { "document-uri": "https://example.com", "violated-directive": "script-src" } } } as Request
        const res = mockRes()

        mockService.saveCspReport.mockResolvedValue({ saved: true, report: { id: 1, payload: {}, createdAt: new Date() } })

        await receiveCspReport(req, res)

        expect(mockService.saveCspReport).toHaveBeenCalledWith({ "document-uri": "https://example.com", "violated-directive": "script-src" })
        expect(res.status).toHaveBeenCalledWith(204)
    })

    it("should return 204 when report is invalid (ignored)", async () => {
        const req = { body: { invalid: true } } as Request
        const res = mockRes()

        mockService.saveCspReport.mockResolvedValue({ saved: false, reason: "Payload CSP invalide" })

        await receiveCspReport(req, res)

        expect(res.status).toHaveBeenCalledWith(204)
    })

    it("should use body directly when no csp-report wrapper", async () => {
        const payload = { "document-uri": "https://example.com", "violated-directive": "script-src" }
        const req = { body: payload } as Request
        const res = mockRes()

        mockService.saveCspReport.mockResolvedValue({ saved: true, report: { id: 1, payload: {}, createdAt: new Date() } })

        await receiveCspReport(req, res)

        expect(mockService.saveCspReport).toHaveBeenCalledWith(payload)
    })
})

describe("listCspReports", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should return reports as JSON", async () => {
        const req = {} as Request
        const res = mockRes()

        mockService.cleanupOldReports.mockResolvedValue(undefined)

        await listCspReports(req, res)

        expect(res.json).toHaveBeenCalled()
    })
})
