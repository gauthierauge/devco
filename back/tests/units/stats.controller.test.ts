import { jest } from "@jest/globals"
import { Request, Response } from "express"

const mockGetProductStats = jest.fn<any>()

jest.unstable_mockModule("@/config/db.js", () => ({
    prisma: { product: { groupBy: jest.fn() } },
}))
jest.unstable_mockModule("@/services/stats.service.js", () => ({
    getProductStats: mockGetProductStats,
}))

const { getStats } = await import("@/controllers/stats.controller.js")

const mockRes = () => {
    const res = {} as Response
    res.status = jest.fn().mockReturnThis() as any
    res.json = jest.fn().mockReturnThis() as any
    return res
}

describe("getStats", () => {
    beforeEach(() => jest.clearAllMocks())

    it("doit appeler getProductStats et renvoyer le resultat en JSON", async () => {
        const stats = [{ nom: "Electronics", compte: 5 }]
        mockGetProductStats.mockResolvedValue(stats)

        const req = {} as Request
        const res = mockRes()

        await getStats(req, res)

        expect(mockGetProductStats).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(stats)
    })
})
