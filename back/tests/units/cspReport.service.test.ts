import { saveCspReport, cleanupOldReports } from "../../src/services/cspReport.service.js"
import * as repository from "../../src/repositories/cspReport.repository.js"

jest.mock("../../src/config/db.js", () => ({ prisma: {} }))
jest.mock("../../src/repositories/cspReport.repository.js")
jest.mock("../../src/config/logger.js", () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const mockedRepo = repository as jest.Mocked<typeof repository>

const validPayload = {
    "document-uri": "https://example.com",
    "violated-directive": "script-src",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'",
    "blocked-uri": "https://evil.com",
    "status-code": 200,
}

describe("saveCspReport", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should save a valid CSP payload", async () => {
        mockedRepo.createCspReport.mockResolvedValue({ id: 1, payload: validPayload, createdAt: new Date() })
        mockedRepo.countCspReports.mockResolvedValue(1)

        const result = await saveCspReport(validPayload)

        expect(result.saved).toBe(true)
        expect(mockedRepo.createCspReport).toHaveBeenCalledWith(validPayload)
    })

    it("should reject null payload", async () => {
        const result = await saveCspReport(null)

        expect(result.saved).toBe(false)
        expect(result.reason).toBe("Payload CSP invalide")
        expect(mockedRepo.createCspReport).not.toHaveBeenCalled()
    })

    it("should reject an array payload", async () => {
        const result = await saveCspReport([1, 2, 3])

        expect(result.saved).toBe(false)
    })

    it("should reject payload missing required fields", async () => {
        const result = await saveCspReport({ "blocked-uri": "https://evil.com" })

        expect(result.saved).toBe(false)
    })

    it("should reject payload with unknown fields", async () => {
        const result = await saveCspReport({
            "document-uri": "https://example.com",
            "violated-directive": "script-src",
            "unknown-field": "nope",
        })

        expect(result.saved).toBe(false)
    })

    it("should trigger cleanup after saving", async () => {
        mockedRepo.createCspReport.mockResolvedValue({ id: 1, payload: validPayload, createdAt: new Date() })
        mockedRepo.countCspReports.mockResolvedValue(50)

        await saveCspReport(validPayload)

        expect(mockedRepo.countCspReports).toHaveBeenCalled()
    })
})

describe("cleanupOldReports", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should not delete when count is under limit", async () => {
        mockedRepo.countCspReports.mockResolvedValue(50)

        await cleanupOldReports()

        expect(mockedRepo.deleteCspReportsByIds).not.toHaveBeenCalled()
    })

    it("should delete excess reports when over limit", async () => {
        mockedRepo.countCspReports.mockResolvedValue(105)
        mockedRepo.getLatestCspReports.mockResolvedValue([
            { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
        ])
        mockedRepo.deleteCspReportsByIds.mockResolvedValue({ count: 5 })

        await cleanupOldReports()

        expect(mockedRepo.getLatestCspReports).toHaveBeenCalledWith(5)
        expect(mockedRepo.deleteCspReportsByIds).toHaveBeenCalledWith([1, 2, 3, 4, 5])
    })
})
