import { jest } from "@jest/globals"

const mockGroupBy = jest.fn<any>()

jest.unstable_mockModule("@/config/db.js", () => ({
    prisma: {
        product: {
            groupBy: mockGroupBy,
        },
    },
}))

const { getProductStats } = await import("@/services/stats.service.js")

describe("getProductStats", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should call prisma.product.groupBy and transform the result", async () => {
        mockGroupBy.mockResolvedValue([
            { category: "Electronics", _count: { _all: 5 } },
            { category: "Books", _count: { _all: 3 } },
        ])

        const result = await getProductStats()

        expect(mockGroupBy).toHaveBeenCalledWith({
            by: ["category"],
            _count: { _all: true },
        })
        expect(result).toEqual([
            { nom: "Electronics", compte: 5 },
            { nom: "Books", compte: 3 },
        ])
    })

    it("should return empty array when no products", async () => {
        mockGroupBy.mockResolvedValue([])

        const result = await getProductStats()

        expect(result).toEqual([])
    })
})
