import { receiveCspReport, listCspReports } from "@/controllers/cspReport.controller.js"
import * as service from "@/services/cspReport.service.js"
import { Request, Response } from "express"

jest.mock("@/config/db.js", () => ({ prisma: {} }))
jest.mock("@/repositories/cspReport.repository.js")
jest.mock("@/services/cspReport.service.js")
jest.mock("@/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const mockedService = service as jest.Mocked<typeof service>

const mockRes = () => {
    const res = {} as Response
    res.status = jest.fn().mockReturnThis()
    res.send = jest.fn().mockReturnThis()
    res.json = jest.fn().mockReturnThis()
    return res
}

describe("receiveCspReport", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should return 204 when report is saved", async () => {
        const req = { body: { "csp-report": { "document-uri": "https://example.com", "violated-directive": "script-src" } } } as Request
        const res = mockRes()

        mockedService.saveCspReport.mockResolvedValue({ saved: true, report: { id: 1, payload: {}, createdAt: new Date() } })

        await receiveCspReport(req, res)

        expect(mockedService.saveCspReport).toHaveBeenCalledWith({ "document-uri": "https://example.com", "violated-directive": "script-src" })
        expect(res.status).toHaveBeenCalledWith(204)
    })

    it("should return 204 when report is invalid (ignored)", async () => {
        const req = { body: { invalid: true } } as Request
        const res = mockRes()

        mockedService.saveCspReport.mockResolvedValue({ saved: false, reason: "Payload CSP invalide" })

        await receiveCspReport(req, res)

        expect(res.status).toHaveBeenCalledWith(204)
    })

    it("should use body directly when no csp-report wrapper", async () => {
        const payload = { "document-uri": "https://example.com", "violated-directive": "script-src" }
        const req = { body: payload } as Request
        const res = mockRes()

        mockedService.saveCspReport.mockResolvedValue({ saved: true, report: { id: 1, payload: {}, createdAt: new Date() } })

        await receiveCspReport(req, res)

        expect(mockedService.saveCspReport).toHaveBeenCalledWith(payload)
    })
})

describe("listCspReports", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should return reports as JSON", async () => {
        const req = {} as Request
        const res = mockRes()

        mockedService.cleanupOldReports.mockResolvedValue(undefined)

        await listCspReports(req, res)

        expect(res.json).toHaveBeenCalled()
    })
})
